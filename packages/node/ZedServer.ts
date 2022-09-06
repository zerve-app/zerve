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
  ZObservable,
  defineKeySource,
  validateWithSchema,
  ZAuthContainer,
  UnauthorizedError,
  CacheOptions,
} from "@zerve/zed";
import express, { Request, Response } from "express";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";
import { ParsedQs } from "qs";
import { WebSocketServer } from "ws";
import { createHash } from "crypto";
import { createServer } from "http";

const DEV = process.env.NODE_ENV === "dev";

function getCacheControl(cacheOptions: CacheOptions, responseValue: string) {
  let cacheHeader = "";
  if (cacheOptions.isPrivate === false) {
    cacheHeader = "public";
  } else {
    // default to private when isPrivate is undefined
    cacheHeader = "private";
  }
  if (cacheOptions.isImmutable) {
    cacheHeader += ", immutable";
  } else if (cacheOptions.isVolatile) {
    cacheHeader += ", no-cache";
  } else {
    cacheHeader += ", max-age=10";
  }
  const etag = createHash("md5")
    .update(responseValue, "utf8")
    .digest()
    .toString("hex");
  return [cacheHeader, etag];
}

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

export async function startZedServer(
  port: number,
  zed: AnyZed,
  onEvent?: (name: string, event: any) => void,
) {
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
      "X-Requested-With, Content-Type, Authorization",
    );
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
    })),
  );

  async function handleGetZedRequest<
    StateSchema extends JSONSchema,
    GetOptions,
  >(
    zed: ZGettable<StateSchema, GetOptions>,
    method: Request["method"],
    headers: HeaderStuffs,
    query: GetOptions,
    cacheOptions: CacheOptions,
  ) {
    if (method === "GET") {
      const value = await zed.get(query);
      return [value, cacheOptions];
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleObserveZedRequest<
    StateSchema extends JSONSchema,
    GetOptions,
  >(
    zed: ZObservable<StateSchema>,
    method: Request["method"],
    headers: HeaderStuffs,
    contextPath: string[],
    query?: {
      zClientSubscribe?: string;
    },
    cacheOptions: CacheOptions,
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
      return [value, cacheOptions];
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleActionZedRequest<
    Schema extends JSONSchema,
    Response extends JSONSchema,
  >(
    zed: ZAction<Schema, Response>,
    method: Request["method"],
    headers: HeaderStuffs,
    body: any,
    cacheOptions: CacheOptions,
  ) {
    if (method === "GET") {
      return [
        {
          requestSchema: zed.payloadSchema,
          responseSchema: zed.responseSchema,
        },
        cacheOptions,
      ];
    } else if (method === "POST") {
      const validBody = validateWithSchema(zed.payloadSchema, body);
      const result = await zed.call(validBody);
      return [
        result || null,
        {
          // ignore cacheOptions intentionally because this is a post request...
        },
      ];
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleZContainerRequest<Z extends Record<string, AnyZed>>(
    zed: ZContainer<Z>,
    method: Request["method"],
    headers: HeaderStuffs,
    cacheOptions: CacheOptions,
  ) {
    if (method === "GET") {
      return [{ children: Object.keys(zed.z) }, cacheOptions];
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method },
    );
  }

  async function handleZAuthContainerRequest<
    AuthZ extends Record<string, AnyZed>,
  >(
    zed: ZAuthContainer<AuthZ>,
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any,
    cacheOptions: CacheOptions,
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
      body,
      { ...cacheOptions, isPrivate: true },
    );
  }

  async function handleZGroupRequest<Z extends AnyZed, O extends ParsedQs, R>(
    zed: ZGroup<Z, O, R>,
    method: Request["method"],
    headers: HeaderStuffs,
    query: O,
    cacheOptions: CacheOptions,
  ) {
    if (method === "GET") {
      const getValue = await zed.get(query);
      return [getValue, cacheOptions];
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method },
    );
  }

  async function handleZStaticRequest<V>(
    zed: ZStatic<V>,
    cacheOptions: CacheOptions,
  ) {
    return [zed.value, cacheOptions];
  }

  async function handleJSONPromise(
    req: Request,
    res: Response,
    promisedValue: Promise<any>,
  ) {
    await promisedValue
      .then((resolved) => {
        const [response, cacheOptions] = resolved;
        const responseValue = stringify(response);
        const [cacheHeader, etag] = getCacheControl(
          cacheOptions,
          responseValue,
        );
        if (req.headers["If-None-Match"] === etag) {
          res.status(304).send();
        }
        res.header("ETag", etag);
        res.header("Cache-Control", cacheHeader);

        res.status(200).send(responseValue);
      })
      .catch((e) => {
        console.error(e);
        if (e.httpStatus === 401) {
          res.header("WWW-Authenticate", "Basic realm=AuthTokenRequired");
        }
        res.status(e.httpStatus || 500).send(
          stringify({
            message: e.message,
            code: e.code,
            details: e.details,
          }),
        );
      });
  }

  async function handleZNodeRequest(
    zed: AnyZed,
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any,
    cacheOptions: CacheOptions,
  ) {
    if (zed.zType === "ZAnnotateCache") {
      return await handleZNodeRequest(
        zed.z,
        query,
        method,
        contextPath,
        headers,
        body,
        {
          ...cacheOptions,
          ...zed.cacheOptions,
        },
      );
    }
    if (zed.zType === "Gettable") {
      return await handleGetZedRequest(
        zed,
        method,
        headers,
        query,
        cacheOptions,
      );
    }
    if (zed.zType === "Observable") {
      return await handleObserveZedRequest(
        zed,
        method,
        headers,
        contextPath,
        query,
        cacheOptions,
      );
    }
    if (zed.zType === "Action") {
      return await handleActionZedRequest(
        zed,
        method,
        headers,
        body,
        cacheOptions,
      );
    }
    if (zed.zType === "Group") {
      return await handleZGroupRequest(
        zed,
        method,
        headers,
        query,
        cacheOptions,
      );
    }
    if (zed.zType === "Container") {
      return await handleZContainerRequest(zed, method, headers, cacheOptions);
    }
    if (zed.zType === "AuthContainer") {
      return await handleZAuthContainerRequest(
        zed,
        query,
        method,
        contextPath,
        headers,
        body,
        cacheOptions,
      );
    }
    if (zed.zType === "Static") {
      return await handleZStaticRequest(zed, cacheOptions);
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
        meta: zed.meta,
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
        meta: zed.meta,
      };
    }
    if (zed.zType === "Group") {
      return {
        ...serviceInfo,
        ".t": "Group",
        value: zed.valueSchema,
        meta: zed.meta,
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
        meta: zed.value?.meta,
      };
    }
    if (zed.zType === "ZAnnotateCache") {
      return handleZNodeTypeSummaryRequest(zed.z);
    }
    throw new Error("unknown zed.t: " + zed.zType);
  }

  async function handleZNodeTypeRequest(
    zed: AnyZed,
    headers: HeaderStuffs,
    cacheOptions: CacheOptions,
  ) {
    if (zed.zType === "Container") {
      return [
        {
          ...serviceInfo,
          ".t": "Container",
          meta: zed.meta,
          children: Object.fromEntries(
            Object.entries(zed.z).map(([childKey, childZed]) => {
              return [childKey, handleZNodeTypeSummaryRequest(childZed)];
            }),
          ),
        },
        cacheOptions,
      ];
    }
    if (zed.zType === "AuthContainer") {
      const { auth } = headers;
      const authZed = auth && (await zed.getAuthZed(auth[0], auth[1]));
      if (!authZed)
        throw new UnauthorizedError("Unauthorized", "Unauthorized", {});

      const [authType, nodeCacheOptions] = await handleZNodeTypeRequest(
        authZed,
        headers,
        cacheOptions,
      );
      return [
        {
          ...serviceInfo,
          ".t": "AuthContainer",
          authType,
        },
        nodeCacheOptions,
      ];
    }
    return [handleZNodeTypeSummaryRequest(zed), cacheOptions];
  }

  async function handleZRequest<Z extends AnyZed>(
    zed: Z,
    path: string[],
    query: ParsedQs,
    method: Request["method"],
    contextPath: string[],
    headers: HeaderStuffs,
    body: any,
    cacheOptions: CacheOptions,
  ): Promise<any> {
    if (path.length === 0)
      return await handleZNodeRequest(
        zed,
        query,
        method,
        contextPath,
        headers,
        body,
        cacheOptions,
      );

    if (zed.zType === "ZAnnotateCache") {
      return await handleZRequest(
        zed.z,
        path,
        query,
        method,
        contextPath,
        headers,
        body,
        {
          ...cacheOptions,
          ...zed.cacheOptions,
        },
      );
    }

    if (path.length === 1 && path[0] === ".type") {
      return await handleZNodeTypeRequest(zed, headers, cacheOptions);
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
                "/",
              )}/${resultingSubPath.join("/")} array.`,
              { subPath: resultingSubPath, path, pathTerm },
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
              "/",
            )}/${resultingSubPath.join("/")}`,
            { subPath: resultingSubPath, path, pathTerm },
          );
        }
        resultingValue = v;
        resultingSubPath.push(pathTerm);
      }
      return [resultingValue, cacheOptions];
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
        body,
        cacheOptions,
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
        body,
        {
          ...cacheOptions,
          isPrivate: true,
        },
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
        body,
        cacheOptions,
      );
    }

    throw new NotFoundError("NotFound", "Not found", { path });
  }

  const parseJSON = json({
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
    function handleReqWithBody(body?: any) {
      const handled = handleZRequest(
        zed,
        pathSegments,
        req.query,
        req.method,
        [],
        headers,
        body,
        {},
      )
        .then((resolved) => {
          const [resolvedValue, resolvedOptions] = resolved;
          onEvent?.("Request", {
            resolvedValue,
            resolvedOptions,
            path: req.path,
            query: req.query,
            method: req.method,
            body,
            headers,
          });
          return resolved;
        })
        .catch((e) => {
          onEvent?.("RequestError", {
            error: {
              message: e.message,
              code: e.code,
              details: e.details,
            },
            path: req.path,
            query: req.query,
            method: req.method,
            body,
            headers,
          });
          throw e;
        });
      handleJSONPromise(req, res, handled);
    }

    if (
      (req.method === "POST" ||
        req.method === "PATCH" ||
        req.method === "PUT") &&
      req.headers["content-type"] === "application/json"
    ) {
      parseJSON(req, res, (err) => {
        if (err) {
          onEvent?.("RequestError", {
            error: {
              message: err.message,
              code: "BodyParseError",
              details: {},
            },
            path: req.path,
            query: req.query,
            method: req.method,
            headers,
          });
          // todo, probably wrap with RequestError so more metadata will flow
          handleJSONPromise(req, res, Promise.reject(err));
          return;
        }
        let body = req.body;
        if (body._$RAW_VALUE !== undefined) {
          body = body._$RAW_VALUE;
        }
        handleReqWithBody(body);
      });
    } else {
      handleReqWithBody(undefined);
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
