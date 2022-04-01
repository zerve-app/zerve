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
} from "@zerve/core";
import express, { Request, Response } from "express";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";
import { ParsedQs } from "qs";

export async function startZedServer(port: number, zed: AnyZed) {
  const app = express();

  app.use((req, res, next) => {
    // todo proper cors policy
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.get(
    "/",
    createJSONHandler(async () => ({
      response: "Coming Soon.",
    }))
  );

  async function handleGetZedRequest<
    StateSchema extends JSONSchema,
    GetOptions
  >(
    zed: ZGettable<StateSchema, GetOptions>,
    method: Request["method"],
    query: GetOptions
  ) {
    if (method === "GET") {
      const value = await zed.get(query);
      return value;
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleActionZedRequest<Schema, Response>(
    zed: ZAction<Schema, Response>,
    method: Request["method"],
    body: any
  ) {
    if (method === "GET") {
      return {
        requestSchema: zed.payloadSchema,
        responseSchema: zed.responseSchema,
      };
    } else if (method === "POST") {
      const result = await zed.call(body);
      return result;
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleZContainerRequest<Z extends Record<string, AnyZed>>(
    zed: ZContainer<Z>,
    method: Request["method"]
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

  async function handleZGroupRequest<Z extends AnyZed, O extends ParsedQs, R>(
    zed: ZGroup<Z, O, R>,
    method: Request["method"],
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
        const responseValue = JSON.stringify(response);
        res.status(200).send(responseValue);
      })
      .catch((e) => {
        console.error(e);
        res.status(e.httpStatus || 500).send(
          JSON.stringify({
            message: e.message,
            code: e.code,
            params: e.params,
          })
        );
      });
  }

  async function handleZNodeRequest(
    zed: AnyZed,
    query: ParsedQs,
    method: Request["method"],
    headers: Request["headers"],
    body: any
  ) {
    if (zed.zType === "Gettable") {
      return await handleGetZedRequest(zed, method, query);
    }
    if (zed.zType === "Action") {
      return await handleActionZedRequest(zed, method, body);
    }
    if (zed.zType === "Group") {
      return await handleZGroupRequest(zed, method, query);
    }
    if (zed.zType === "Container") {
      return await handleZContainerRequest(zed, method);
    }
    if (zed.zType === "Static") {
      return await handleZStaticRequest(zed);
    }
    console.log("fail!!", zed);
    throw new Error("unknown zed");
  }

  const serviceInfo = {
    // ".z": Z_PROTOCOL_VERSION,
    ".v": "0.1.0",
  };

  function handleZNodeTypeRequest(zed: AnyZed) {
    if (zed.zType === "Gettable") {
      return {
        ...serviceInfo,
        ".t": "Gettable",
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
        children: Object.fromEntries(
          Object.entries(zed.z).map(([childKey, childZed]) => {
            return [childKey, handleZNodeTypeRequest(childZed)];
          })
        ),
      };
    }
    if (zed.zType === "Static") {
      return {
        ...serviceInfo,
        ".t": "Static",
      };
    }
    throw new Error("unknown zed");
  }

  async function handleZRequest<Z extends AnyZed>(
    zed: Z,
    path: string[],
    query: ParsedQs,
    method: Request["method"],
    headers: Request["headers"],
    body: any
  ): Promise<any> {
    if (path.length === 0)
      return await handleZNodeRequest(zed, query, method, headers, body);

    if (path.length === 1 && path[0] === ".type") {
      return await handleZNodeTypeRequest(zed);
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
        headers,
        body
      );
    }

    throw new NotFoundError("NotFound", "Not found", { path });
  }

  const jsonHandler = json();

  function zHandler(req: Request, res: Response) {
    const pathSegments = req.path
      .split("/")
      .filter((segment) => segment !== "");
    if (
      (req.method === "POST" ||
        req.method === "PATCH" ||
        req.method === "PUT") &&
      req.headers["content-type"] === "application/json"
    ) {
      jsonHandler(req, res, () => {
        let body = req.body;
        if (body.__Z_RAW_VALUE_AND_BODY_PARSER_IS_IGNORANT) {
          body = body.__Z_RAW_VALUE_AND_BODY_PARSER_IS_IGNORANT;
        }
        handleJSONPromise(
          res,
          handleZRequest(
            zed,
            pathSegments,
            req.query,
            req.method,
            req.headers,
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
          req.headers,
          undefined
        )
      );
    }
  }

  app.use("/.z", zHandler);
  app.use("/.z/*", zHandler);

  await new Promise<void>((resolve, reject) => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      resolve();
    });
  });
}
