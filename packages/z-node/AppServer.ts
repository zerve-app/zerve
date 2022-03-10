import {
  ActionDefinition,
  ActionZot,
  AnyZot,
  GetZot,
  NotFoundError,
  WrongMethodError,
  JSONSchema,
  StaticContainerZot,
} from "@zerve/core";
import express, { Request, Response } from "express";
import { ServerContext } from "./ServerContext";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";
import { ParsedQs } from "qs";

export async function startZotServer(
  port: number,
  context: ServerContext,
  zot: AnyZot
) {
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
    zot: GetZot<StateSchema, GetOptions>,
    method: Request["method"],
    query: GetOptions
  ) {
    console.log("handleGetZotRequest", zot.zType, method, query);
    if (method === "GET") {
      const value = await zot.get(query);
      console.log("ok", value);
      return { schema: zot.valueSchema, value };
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleActionZotRequest<Schema, Response>(
    zot: ActionZot<Schema, Response>,
    method: Request["method"],
    body: any
  ) {
    if (method === "GET") {
      return { payload: zot.payloadSchema };
    } else if (method === "POST") {
      // const validBody = zot.validatePayload()
      const result = await zot.call(body);
      return result;
    } else {
      throw new WrongMethodError("WrongMethod", "Method not available", {});
    }
  }

  async function handleStaticContainerZotRequest<
    Z extends Record<string, AnyZot>
  >(zot: StaticContainerZot<Z>) {
    return { children: Object.keys(zot.zots) };
  }

  async function handleJSONPromise(res: Response, promisedValue: Promise<any>) {
    await promisedValue
      .then((response) => {
        console.log("THENDD", response);
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
    console.log(zot.zType);
    if (zot.zType === "Get") {
      return await handleGetZotRequest(zot, method, query);
    }
    if (zot.zType === "Action") {
      return await handleActionZotRequest(zot, method, body);
    }
    if (zot.zType === "Container") {
      throw new Error("not yet");
    }
    if (zot.zType === "StaticContainer") {
      return await handleStaticContainerZotRequest(zot);
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

    if (zot.zType === "StaticContainer") {
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

    if (zot.zType === "Container") {
      const [pathTerm, ...restPathTerms] = path;

      const child = await zot.get(pathTerm);
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

  // app.get(
  //   "/.z/.blocks",
  //   createJSONHandler(async function listBlocks() {
  //     return { response: await data.listBlocks() };
  //   })
  // );

  // app.use("/.blocks", express.static(context.blocksDir));

  // app.get(
  //   "/.z",
  //   createJSONHandler(async function listDocs() {
  //     return { response: await data.listDocs() };
  //   })
  // );

  // app.get(
  //   "/.z/.action",
  //   createJSONHandler(async function postAction({}: Request) {
  //     return {
  //       response: {
  //         children: ActionRegistryGroups,
  //       },
  //     };
  //   })
  // );

  // app.get(
  //   "/.z/.action:/category",
  //   createJSONHandler(async function postAction({
  //     params: { category },
  //   }: Request) {
  //     const categoryActions =
  //       ActionRegistry[category as keyof typeof ActionRegistry];
  //     if (!categoryActions)
  //       throw new NotFoundError(
  //         "NotFound",
  //         `Action category "${category}" not found`,
  //         { category }
  //       );
  //     const publicActions = Object.fromEntries(
  //       Object.keys(categoryActions).map((actionName) => {
  //         const actionDef = categoryActions[
  //           actionName as keyof typeof categoryActions
  //         ] as undefined | ActionDefinition<any, any>;
  //         return [
  //           actionName,
  //           {
  //             payloadSchema: actionDef?.payloadSchema,
  //           },
  //         ];
  //       })
  //     );
  //     return {
  //       response: { actions: publicActions },
  //     };
  //   })
  // );

  // app.post(
  //   "/.z/.action",
  //   json(),
  //   createJSONHandler(async function postAction({ body }: Request) {
  //     const actionDef = AllActions[body.type];
  //     if (!actionDef)
  //       throw new NotFoundError(
  //         "NotFound",
  //         `Action with type "${body.type}" could not be found`,
  //         { type: body.type }
  //       );
  //     const result = await actionDef.handleUnsafe(body.payload);
  //     return {
  //       response: {
  //         result,
  //       },
  //     };
  //   })
  // );

  // app.get(
  //   "/.z/.eval/*",
  //   createJSONHandler(async function getEval({
  //     params: { 0: evalPath },
  //   }: Request) {
  //     return {
  //       response: await data.getEval(evalPath),
  //     };
  //   })
  // );

  // app.get(
  //   "/.z/.module",
  //   createJSONHandler(async function getRef() {
  //     return { response: { modules: Object.keys(zModules) } };
  //   })
  // );

  // app.get(
  //   "/.z/.module/:moduleName",
  //   createJSONHandler(async function getRef({
  //     params: { moduleName },
  //   }: Request) {
  //     const module = zModules[moduleName];
  //     if (!module)
  //       throw new NotFoundError(
  //         "NotFound",
  //         `Module "${moduleName}" Not Found`,
  //         { moduleName }
  //       );
  //     return {
  //       response: {
  //         moduleName,
  //         stateSchema: module.state.schema,
  //         actions: Object.fromEntries(
  //           Object.entries(module.actions).map(
  //             ([actionName, action]: [string, any]) => {
  //               return [actionName, { payloadSchema: action.payloadSchema }];
  //             }
  //           )
  //         ),
  //       },
  //     };
  //   })
  // );

  // app.get(
  //   "/.z/:docName",
  //   createJSONHandler(async function getRef({ params: { docName } }: Request) {
  //     const doc = await data.getDoc(docName);
  //     if (doc.value === undefined) {
  //       throw new NotFoundError(
  //         "NotFoundError",
  //         `Doc "${docName}" could not be found.`,
  //         { docName }
  //       );
  //     }
  //     return {
  //       response: doc,
  //     };
  //   })
  // );

  await new Promise<void>((resolve, reject) => {
    app.listen(context.port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      resolve();
    });
  });
}
