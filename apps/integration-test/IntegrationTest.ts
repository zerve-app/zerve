import fetch from "node-fetch";
import { spawn, execFile as execFileCb } from "child_process";
import { StringSchema } from "@zerve/zed";
import rimraf from "rimraf";
import { join as joinPath } from "path";

import { TestStoreSchemasPublic, TestEntrySchemas } from "./TestStoreSchemas";

type Closable = { close: () => void };

function execFile(cmd: string, args: string[], opts: {}) {
  return new Promise<void>((resolve, reject) => {
    execFileCb(cmd, args, opts, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function startTestServer(
  scriptName: string,
  port: number,
): Promise<Closable> {
  await execFile(
    "npx",
    [
      "esbuild",
      `./${scriptName}.ts`,
      "--bundle",
      "--platform=node",
      `--outfile=build/${scriptName}.js`,
      "--log-level=error",
    ],
    {},
  );
  const server = spawn("node", [`build/${scriptName}.js`], {
    env: { ...process.env, PORT: String(port) },
    stdio: "pipe",
  });
  return new Promise<Closable>((resolve, reject) => {
    const serverStartTimeout = setTimeout(() => {
      reject(new Error("Test server timed out while starting"));
    }, 5000);
    function close() {
      server.kill("SIGINT");
    }
    server.on("error", (e) => {
      console.log("server error!", e);
    });

    server.stderr.on("data", (outBuffer) => {
      const out = outBuffer.toString("utf8");
      console.log("!> ", out);
    });
    server.stdout.on("data", (outBuffer) => {
      const out = outBuffer.toString("utf8");
      console.log(">> ", out);
      if (out.match(`http://localhost:${port}`)) {
        clearTimeout(serverStartTimeout);
        resolve({ close });
      }
    });
  });
}

async function get(port: number, path: string) {
  const res = await fetch(`http://localhost:${port}/.z/${path}`);
  const json = await res.json();
  return { body: json, status: res.status };
}

async function post(port: number, path: string, data: any) {
  const res = await fetch(`http://localhost:${port}/.z/${path}`, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  return { body: json, status: res.status };
}

function expectEqual(value: any, expectedValueToEqual: any, note?: string) {
  const valueString = JSON.stringify(value);
  const expectedString = JSON.stringify(expectedValueToEqual);
  if (valueString !== expectedString) {
    throw new Error(
      `Expected ${valueString} to equal ${expectedString}. ${note || ""}`,
    );
  }
}

async function runStoreTest() {
  const port = 9899;
  await new Promise<void>((resolve, reject) =>
    rimraf(joinPath(process.cwd(), "test-data/basic"), (err) => {
      if (err) reject(err);
      else resolve();
    }),
  );
  const server = await startTestServer("TestStoreServer", port);
  try {
    const rootQuery = await get(port, "");
    expectEqual(
      rootQuery.body,
      { children: ["Dispatch", "State"] },
      "rootQuery get output",
    );
    const stateQuery = await get(port, "State");
    expectEqual(
      stateQuery.body,
      { $schemas: TestStoreSchemasPublic },
      "stateQuery get output",
    );
    await post(port, "Dispatch", {
      name: "CreateValue",
      value: {
        name: "E1",
        schema: StringSchema,
        value: "Hello world",
      },
    });
    const e1 = await get(port, "State/E1/value");
    expectEqual(e1.body, "Hello world");
    expectEqual(
      (await post(port, "Dispatch", { name: "Delete", value: { name: "E1" } }))
        .status,
      200,
      "may delete the entry",
    );
    expectEqual(
      (await get(port, "State/E1")).status,
      404,
      "deleted value is not found",
    );
    server.close();
  } catch (e) {
    server.close();
    throw e;
  }
}

async function runStaticStoreTest() {
  const port = 9897;
  await new Promise<void>((resolve, reject) =>
    rimraf(joinPath(process.cwd(), "test-data/static"), (err) => {
      if (err) reject(err);
      else resolve();
    }),
  );
  const server = await startTestServer("TestStaticStoreServer", port);
  try {
    const rootQuery = await get(port, "");
    expectEqual(
      rootQuery.body,
      { children: ["Dispatch", "State"] },
      "rootQuery get output",
    );
    const fullStateQuery = await get(port, "State");
    expectEqual(
      fullStateQuery.body,
      {
        $schemas: TestStoreSchemasPublic,
        // referencing TestStoreEntrySchemas
        TestList: {
          value: [],
          schema: TestEntrySchemas.TestList,
        },
      },
      "full static stateQuery get output",
    );
    const stateQuery = await get(port, "State/TestList");
    expectEqual(stateQuery.status, 200, "static state query succeeds");
    expectEqual(
      stateQuery.body,
      {
        value: [],
        schema: TestEntrySchemas.TestList,
      },
      "initial stateQuery get output",
    );
    const failedCreate = await post(port, "Dispatch", {
      name: "CreateValue",
      value: {
        name: "TestList",
        schema: StringSchema,
        value: "Hello world",
      },
    });
    expectEqual(failedCreate.status, 400, "CreateValue fails for static value");
    const failedWrite = await post(port, "Dispatch", {
      name: "WriteSchemaValue",
      value: {
        name: "TestList",
        schema: StringSchema,
        value: "Hello world",
      },
    });
    expectEqual(
      failedWrite.status,
      400,
      "WriteSchemaValue fails for static value",
    );
    const write = await post(port, "Dispatch", {
      name: "WriteValue",
      value: {
        name: "TestList",
        value: [{ r: 1 }],
      },
    });
    expectEqual(write.status, 200, "Write succeeds for static value");

    expectEqual(
      (await get(port, "State/TestList/value")).body,
      [{ r: 1 }],
      "written static list get value",
    );
    expectEqual(
      (
        await post(port, "Dispatch", {
          name: "Delete",
          value: { name: "TestList" },
        })
      ).status,
      400,
      "may not delete a static entry",
    );
    expectEqual(
      (
        await post(port, "Dispatch", {
          name: "WriteValue",
          value: {
            name: "TestList",
            value: [{ r: 100 }, { r: 200 }],
          },
        })
      ).status,
      200,
      "wrote static list 2",
    );
    expectEqual(
      (await get(port, "State/TestList/value")).body,
      [{ r: 100 }, { r: 200 }],
      "written static list get value",
    );
    // const e1 = await get(port, "State/E1/value");
    // expectEqual(e1, "Hello world");
    server.close();
  } catch (e) {
    server.close();
    throw e;
  }
}

async function handleTests(tests: Record<string, () => Promise<void>>) {
  const testEntries = Object.entries(tests);
  let syncPromise = Promise.resolve();
  testEntries.forEach(([testName, runTest]) => {
    syncPromise = syncPromise.then(async () => {
      console.log(`Running test "${testName}"`);
      let testPromise = runTest().then(
        () => {
          console.log(`test "${testName}" passed.`);
        },
        (e) => {
          console.error(e);
          console.error(`test "${testName}" failed.`);
        },
      );
      await testPromise;
    });
  });
  await syncPromise;
}

async function runAllTests() {
  await execFile("rm", ["-rf", "test-data"], {});
  await handleTests({
    storeBasic: () => runStoreTest(),
    staticStore: () => runStaticStoreTest(),
  });
}

runAllTests()
  .then(() => {
    console.log("==== done.");
    // process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    console.error("Error Running Tests");
  });
