import {
  AnyZot,
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

export async function startZotServer(port: number, zot: AnyZot) {
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

  async function handleGetZotRequest<
    StateSchema extends JSONSchema,
    GetOptions
  >(
    zot: ZGettable<StateSchema, GetOptions>,
    method: Request["method"],
    query: GetOptions
  ) {
    if (method === "GET") {
      const value = await zot.get(query);
      return value;
    }
    throw new WrongMethodError("WrongMethod", "Method not available", {});
  }

  async function handleActionZotRequest<Schema, Response>(
    zot: ZAction<Schema, Response>,
    method: Request["method"],
    body: any
  ) {
    if (method === "GET") {
      return { payload: zot.payloadSchema };
    } else if (method === "POST") {
      const result = await zot.call(body);
      return result;
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleZContainerRequest<Z extends Record<string, AnyZot>>(
    zot: ZContainer<Z>,
    method: Request["method"]
  ) {
    if (method === "GET") {
      return { children: Object.keys(zot.zots) };
    }
    throw new WrongMethodError(
      "WrongMethod",
      `Method ${method} not available.`,
      { method }
    );
  }

  async function handleZGroupRequest<Z extends AnyZot, O extends ParsedQs, R>(
    zot: ZGroup<Z, O, R>,
    method: Request["method"],
    query: O
  ) {
    if (method === "GET") {
      const listValue = await zot.get(query);
      return listValue;
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
    zot: AnyZot,
    query: ParsedQs,
    method: Request["method"],
    headers: Request["headers"],
    body: any
  ) {
    if (zot.zType === "Gettable") {
      return await handleGetZotRequest(zot, method, query);
    }
    if (zot.zType === "Action") {
      return await handleActionZotRequest(zot, method, body);
    }
    if (zot.zType === "Group") {
      return await handleZGroupRequest(zot, method, query);
    }
    if (zot.zType === "Container") {
      return await handleZContainerRequest(zot, method);
    }
    if (zot.zType === "Static") {
      return await handleZStaticRequest(zot);
    }
    throw new Error("unknown zot");
  }

  async function handleZotRequest(
    zot: AnyZot,
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

      const child = zot.zots[pathTerm];
      if (!child)
        throw new NotFoundError("NotFound", "Not found in container", {
          pathTerm,
        });
      return await handleZotRequest(
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
      return await handleZotRequest(
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
          handleZotRequest(
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
        handleZotRequest(
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
