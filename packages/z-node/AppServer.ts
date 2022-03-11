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
} from "@zerve/core";
import express, { Request, Response } from "express";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";
import { ParsedQs } from "qs";

export async function startZedServer(port: number, zot: AnyZed) {
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
      return { zType: "Action", payload: zed.payloadSchema };
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
      return { zType: "Container", children: Object.keys(zed.zeds) };
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method }
    );
  }

  async function handleZGroupRequest<Z extends AnyZed, O extends ParsedQs, R>(
    zot: ZGroup<Z, O, R>,
    method: Request["method"],
    query: O
  ) {
    if (method === "GET") {
      const listValue = await zot.get(query);
      return { zType: "Group", children: listValue };
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method }
    );
  }

  async function handleZStaticRequest<V>(zot: ZStatic<V>) {
    // return { zType: "Static", value: zot.value };
    return zot.value;
    // /.z/.types/Color
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

  async function handleZotNodeRequest(
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
    throw new Error("unknown zed");
  }

  async function handleZedRequest<Z extends AnyZed>(
    zot: Z,
    path: string[],
    query: ParsedQs,
    method: Request["method"],
    headers: Request["headers"],
    body: any
  ): Promise<any> {
    if (path.length === 0)
      return await handleZotNodeRequest(zot, query, method, headers, body);

    if (zot.zType === "Container") {
      const [pathTerm, ...restPathTerms] = path;

      const child = zot.zeds[pathTerm];
      if (!child)
        throw new NotFoundError("NotFound", "Not found in container", {
          pathTerm,
        });
      return await handleZedRequest(
        child,
        restPathTerms,
        query,
        method,
        headers,
        body
      );
    }

    if (zot.zType === "Group") {
      const [pathTerm, ...restPathTerms] = path;

      const child = await zot.getChild(pathTerm);
      if (!child)
        throw new NotFoundError("NotFound", "Not found in container", {
          pathTerm,
        });
      return await handleZedRequest(
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

  function zotHandler(req: Request, res: Response) {
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
        handleJSONPromise(
          res,
          handleZedRequest(
            zot,
            pathSegments,
            req.query,
            req.method,
            req.headers,
            req.body
          )
        );
      });
    } else {
      handleJSONPromise(
        res,
        handleZedRequest(
          zot,
          pathSegments,
          req.query,
          req.method,
          req.headers,
          undefined
        )
      );
    }
  }

  app.use("/.z", zotHandler);
  app.use("/.z/*", zotHandler);

  await new Promise<void>((resolve, reject) => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      resolve();
    });
  });
}
