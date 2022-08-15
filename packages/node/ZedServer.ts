import {
  AnyZed,
  NotFoundError,
  WrongMethodError,
  JSONSchema,
  ZAction,
  ZContainer,
  ZGettable,
  ZGroup,
  ZStatic,
  Z_PROTOCOL_VERSION,
  ZObservable,
  defineKeySource,
  getValidatorOfSchema,
  validateWithSchema,
  ZAuthContainer,
  GenericError,
  UnauthorizedError,
} from "@zerve/core";
import express, { Request, Response } from "express";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";
import { ParsedQs } from "qs";
import { WebSocketServer } from "ws";
import { createHash } from "crypto";
import { createServer } from "http";

const DEV = process.env.NODE_ENV === "dev";

function stringify(json: any) {
  return JSON.stringify(json, null, DEV ? 2 : 0);
}

type ZConnectionHelloMessage = {
  t: "Hello";
  id: string;
};

type ZConnectionUpdateMessage = {
  t: "Update";
  path: string[];
  value: any;
};

type ZConnectionMessage = ZConnectionHelloMessage | ZConnectionUpdateMessage;

type Client = {
  send: (message: ZConnectionMessage) => void;
};

export type HeaderStuffs = {
  auth?: Readonly<[string, string]>;
};

export async function startZedServer(port: number, zed: AnyZed) {
  const app = express();

  const connectedClients: Map<string, Client> = new Map();

  const getInternalClientId = defineKeySource("Client");
  function getClientId() {
    const hash = createHash("md5")
      .update(getInternalClientId(), "utf8")
      .digest()
      .toString("hex");
    return hash;
  }

  app.use((req, res, next) => {
    // todo proper cors policy
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "X-Requested-With, Content-Type, Authorization"
    );
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    if (req.method === "OPTIONS") {
      res.send();
      return;
    }
    next();
  });

  app.get(
    "/",
    createJSONHandler(async () => ({
      response: "This is the Zerve API server. The API root is at /.z/",
    }))
  );

  async function handleGetZedRequest<
    StateSchema extends JSONSchema,
    GetOptions
  >(
    zed: ZGettable<StateSchema, GetOptions>,
    method: Request["method"],
    headers: HeaderStuffs,
    query: GetOptions
  ) {
    if (method === "GET") {
      const value = await zed.get(query);
      return value;
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleObserveZedRequest<
    StateSchema extends JSONSchema,
    GetOptions
  >(
    zed: ZObservable<StateSchema>,
    method: Request["method"],
    headers: HeaderStuffs,
    contextPath: string[],
    query?: {
      zClientSubscribe?: string;
    }
  ) {
    if (method === "GET") {
      if (query?.zClientSubscribe) {
        const client = connectedClients.get(query.zClientSubscribe);
        if (client) {
          zed.subscribe((v) => {
            client.send({
              t: "Update",
              value: v,
              path: contextPath,
            });
          });
        }
      }
      const value = await zed.get();
      return value;
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleActionZedRequest<Schema, Response>(
    zed: ZAction<Schema, Response>,
    method: Request["method"],
    headers: HeaderStuffs,
    body: any
  ) {
    if (method === "GET") {
      return {
        requestSchema: zed.payloadSchema,
        responseSchema: zed.responseSchema,
      };
    } else if (method === "POST") {
      const validBody = validateWithSchema(zed.payloadSchema, body);
      const result = await zed.call(validBody);
      return result || null;
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleZContainerRequest<Z extends Record<string, AnyZed>>(
    zed: ZContainer<Z>,
    method: Request["method"],
    headers: HeaderStuffs
  ) {
    if (method === "GET") {
      return { children: Object.keys(zed.z) };
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method }
    );
  }

  async function handleZAuthContainerRequest<
    AuthZ extends Record<string, AnyZed>
  >(
    zed: ZAuthContainer<AuthZ>,
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any
  ) {
    if (!headers.auth)
      throw new UnauthorizedError("Unauthorized", "Unauthorized", {});
    const authZed = await zed.getAuthZed(headers.auth[0], headers.auth[1]);

    return await handleZNodeRequest(
      authZed,
      query,
      method,
      contextPath,
      headers,
      body
    );
  }

  async function handleZGroupRequest<Z extends AnyZed, O extends ParsedQs, R>(
    zed: ZGroup<Z, O, R>,
    method: Request["method"],
    headers: HeaderStuffs,
    query: O
  ) {
    if (method === "GET") {
      const getValue = await zed.get(query);
      return getValue;
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method }
    );
  }

  async function handleZStaticRequest<V>(zed: ZStatic<V>) {
    return zed.value;
  }

  async function handleJSONPromise(res: Response, promisedValue: Promise<any>) {
    await promisedValue
      .then((response) => {
        const responseValue = stringify(response);
        res.status(200).send(responseValue);
      })
      .catch((e) => {
        console.error(e);
        res.status(e.httpStatus || 500).send(
          stringify({
            message: e.message,
            code: e.code,
            details: e.details,
          })
        );
      });
  }

  async function handleZNodeRequest(
    zed: AnyZed,
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any
  ) {
    if (zed.zType === "Gettable") {
      return await handleGetZedRequest(zed, method, headers, query);
    }
    if (zed.zType === "Observable") {
      return await handleObserveZedRequest(
        zed,
        method,
        headers,
        contextPath,
        query
      );
    }
    if (zed.zType === "Action") {
      return await handleActionZedRequest(zed, method, headers, body);
    }
    if (zed.zType === "Group") {
      return await handleZGroupRequest(zed, method, headers, query);
    }
    if (zed.zType === "Container") {
      return await handleZContainerRequest(zed, method, headers);
    }
    if (zed.zType === "AuthContainer") {
      return await handleZAuthContainerRequest(
        zed,
        query,
        method,
        contextPath,
        headers,
        body
      );
    }
    if (zed.zType === "Static") {
      return await handleZStaticRequest(zed);
    }
    throw new Error("unknown zed: " + zed.zType);
  }

  const serviceInfo = {
    // ".z": Z_PROTOCOL_VERSION,
    ".v": "0.1.0",
  };

  function handleZNodeTypeSummaryRequest(zed: AnyZed) {
    if (zed.zType === "Gettable") {
      return {
        ...serviceInfo,
        ".t": "Gettable",
        value: zed.valueSchema,
      };
    }
    if (zed.zType === "Observable") {
      return {
        ...serviceInfo,
        ".t": "Observable",
        value: zed.valueSchema,
      };
    }
    if (zed.zType === "Action") {
      return {
        ...serviceInfo,
        ".t": "Action",
        payload: zed.payloadSchema,
        response: zed.responseSchema,
      };
    }
    if (zed.zType === "Group") {
      return {
        ...serviceInfo,
        ".t": "Group",
        value: zed.valueSchema,
      };
    }
    if (zed.zType === "Container") {
      return {
        ...serviceInfo,
        ".t": "Container",
        meta: zed.meta,
        childrenKeys: Object.keys(zed.z),
      };
    }
    if (zed.zType === "AuthContainer") {
      return {
        ...serviceInfo,
        ".t": "AuthContainer",
      };
    }
    if (zed.zType === "Static") {
      return {
        ...serviceInfo,
        ".t": "Static",
      };
    }
    throw new Error("unknown zed.t: " + zed.zType);
  }

  async function handleZNodeTypeRequest(zed: AnyZed, headers: HeaderStuffs) {
    if (zed.zType === "Container") {
      return {
        ...serviceInfo,
        ".t": "Container",
        meta: zed.meta,
        children: Object.fromEntries(
          Object.entries(zed.z).map(([childKey, childZed]) => {
            return [childKey, handleZNodeTypeSummaryRequest(childZed)];
          })
        ),
      };
    }
    if (zed.zType === "AuthContainer") {
      const { auth } = headers;
      const authZed = auth && (await zed.getAuthZed(auth[0], auth[1]));
      if (!authZed)
        throw new UnauthorizedError("Unauthorized", "Unauthorized", {});

      return {
        ...serviceInfo,
        ".t": "AuthContainer",
        authType: await handleZNodeTypeRequest(authZed, headers),
      };
    }
    return handleZNodeTypeSummaryRequest(zed);
  }

  async function handleZRequest<Z extends AnyZed>(
    zed: Z,
    path: string[],
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any
  ): Promise<any> {
    if (path.length === 0)
      return await handleZNodeRequest(
        zed,
        query,
        method,
        contextPath,
        headers,
        body
      );

    if (path.length === 1 && path[0] === ".type") {
      return await handleZNodeTypeRequest(zed, headers);
    }

    if (zed.zType === "Gettable") {
      if (method !== "GET") {
        throw new WrongMethodError("WrongMethod", "Method not available", {});
      }
      const nodeValue = await zed.get(query);
      const resultingSubPath: string[] = [];
      let resultingValue = nodeValue;
      for (let pathTermIndex in path) {
        const pathTerm = path[pathTermIndex];
        let v = undefined;
        if (Array.isArray(resultingValue)) {
          if (isFinite(Number(pathTerm))) {
            throw new NotFoundError(
              "NotFound",
              `Can not look up "${pathTerm}" because it is not a numeric index to the ${contextPath.join(
                "/"
              )}/${resultingSubPath.join("/")} array.`,
              { subPath: resultingSubPath, path, pathTerm }
            );
          }
          v = resultingValue[Number(pathTerm)];
        } else if (resultingValue && typeof resultingValue === "object") {
          v = resultingValue[pathTerm];
        }
        if (v === undefined) {
          throw new NotFoundError(
            "NotFound",
            `Can not look up "${pathTerm}" in /.z/${contextPath.join(
              "/"
            )}/${resultingSubPath.join("/")}`,
            { subPath: resultingSubPath, path, pathTerm }
          );
        }
        resultingValue = v;
        resultingSubPath.push(pathTerm);
      }
      return resultingValue;
    }

    if (zed.zType === "Container") {
      const [pathTerm, ...restPathTerms] = path;

      const child = zed.z[pathTerm];
      if (!child)
        throw new NotFoundError("NotFound", "Not found in container", {
          pathTerm,
        });

      return await handleZRequest(
        child,
        restPathTerms,
        query,
        method,
        [...contextPath, pathTerm],
        headers,
        body
      );
    }

    if (zed.zType === "AuthContainer") {
      const { auth } = headers;
      const authZed = auth && (await zed.getAuthZed(auth[0], auth[1]));
      if (!authZed)
        throw new UnauthorizedError("Unauthorized", "Unauthorized", {});
      return await handleZRequest(
        authZed,
        path,
        query,
        method,
        contextPath,
        headers,
        body
      );
    }

    if (zed.zType === "Group") {
      const [pathTerm, ...restPathTerms] = path;

      const child = await zed.getChild(pathTerm);
      if (!child)
        throw new NotFoundError("NotFound", "Not found in container", {
          pathTerm,
        });
      return await handleZRequest(
        child,
        restPathTerms,
        query,
        method,
        [...contextPath, pathTerm],
        headers,
        body
      );
    }

    throw new NotFoundError("NotFound", "Not found", { path });
  }

  const jsonHandler = json({
    //   strict: true, // considered false here (thanks to _$RAW_VALUE for edge case and https://github.com/expressjs/body-parser/issues/461)
    strict: true,
  });

  function zHandler(req: Request, res: Response) {
    const pathSegments = req.path
      .split("/")
      .filter((segment) => segment !== "");
    const headers: HeaderStuffs = {};
    if (req.headers.authorization) {
      const encoded = req.headers.authorization.slice(6);
      const decoded = atob(encoded);
      const pair = decoded.split(":");
      headers.auth = [pair[0], pair[1]] as const;
    }
    if (
      (req.method === "POST" ||
        req.method === "PATCH" ||
        req.method === "PUT") &&
      req.headers["content-type"] === "application/json"
    ) {
      jsonHandler(req, res, (err) => {
        if (err) {
          // todo, probably wrap with RequestError so more metadata will flow
          handleJSONPromise(res, Promise.reject(err));
          return;
        }
        let body = req.body;
        if (body._$RAW_VALUE !== undefined) {
          body = body._$RAW_VALUE;
        }
        handleJSONPromise(
          res,
          handleZRequest(
            zed,
            pathSegments,
            req.query,
            req.method,
            [],
            headers,
            body
          )
        );
      });
    } else {
      handleJSONPromise(
        res,
        handleZRequest(
          zed,
          pathSegments,
          req.query,
          req.method,
          [],
          headers,
          undefined
        )
      );
    }
  }

  app.use("/.z", zHandler);
  app.use("/.z/*", zHandler);

  await new Promise<void>((resolve, reject) => {
    const httpServer = createServer();
    const wsServer = new WebSocketServer({ server: httpServer });
    wsServer.on("connection", (socket) => {
      function send(message: ZConnectionMessage) {
        socket.send(stringify(message));
      }
      const client: Client = { send };
      const clientId = getClientId();
      connectedClients.set(clientId, client);
      client.send({
        t: "Hello",
        id: clientId,
      });
      socket.on("close", (s) => {
        connectedClients.delete(clientId);
      });
      socket.on("message", (message) => {
        // uhhh
        // console.log(message);
      });
    });
    httpServer.on("request", app);
    httpServer.listen(port, () => {
      console.log(`Server  at http://localhost:${port}`);
      resolve();
    });
  });
}
