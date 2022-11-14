import fetch from "node-fetch";
import { spawn, execFile as execFileCb } from "child_process";
import { StringSchema } from "@zerve/zed";
import rimraf from "rimraf";
import { join as joinPath } from "path";

import { TestStoreSchemasPublic } from "./TestStoreSchemas";

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
  console.log("---- startTestServer");
  await execFile(
    "npx",
    [
      "esbuild",
      `./${scriptName}.ts`,
      "--bundle",
      "--platform=node",
      "--outfile=build/TestStoreServer.js",
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
  return json;
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
  return json;
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
    rimraf(joinPath(process.cwd(), "test-data"), (err) => {
      if (err) reject(err);
      else resolve();
    }),
  );
  const server = await startTestServer("TestStoreServer", port);
  try {
    const rootQuery = await get(port, "");
    expectEqual(
      rootQuery,
      { children: ["Dispatch", "State"] },
      "rootQuery get output",
    );
    const stateQuery = await get(port, "State");
    expectEqual(
      stateQuery,
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
    expectEqual(e1, "Hello world");
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
  await handleTests({
    storeTest: () => runStoreTest(),
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
