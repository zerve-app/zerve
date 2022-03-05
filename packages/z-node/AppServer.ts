import { ActionDefinition, NotFoundError } from "@zerve/core";
import express, { Request, Response } from "express";
import { ServerContext } from "./ServerContext";
import { createJSONHandler } from "./Server";
import { json } from "body-parser";

export async function createApp(
  port: number,
  context: ServerContext,
  zModules: any,
  data: any,
  auth: any
) {
  const app = express();

  app.use((req, res, next) => {
    // todo proper cors policy
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  const ActionRegistry = {
    DataBase: data.actions,
    Auth: auth.actions,
  } as const;
  const ActionRegistryGroups = Object.keys(ActionRegistry);
  const AllActions: Record<
    string,
    ActionDefinition<any, any>
  > = Object.fromEntries(
    ActionRegistryGroups.map((actionGroupName) => {
      const actionGroup =
        ActionRegistry[actionGroupName as keyof typeof ActionRegistry];
      return Object.keys(actionGroup).map((actionName) => {
        const actionDef = actionGroup[actionName as keyof typeof actionGroup];
        return [`${actionGroupName}/${actionName}`, actionDef];
      });
    }).flat()
  );

  app.get(
    "/",
    createJSONHandler(async () => ({
      response: "Coming Soon.",
    }))
  );

  app.get(
    "/.z/.blocks",
    createJSONHandler(async function listBlocks() {
      return { response: await data.listBlocks() };
    })
  );

  app.use("/.blocks", express.static(context.blocksDir));

  app.get(
    "/.z",
    createJSONHandler(async function listDocs() {
      return { response: await data.listDocs() };
    })
  );

  app.get(
    "/.z/.action",
    createJSONHandler(async function postAction({}: Request) {
      return {
        response: {
          children: ActionRegistryGroups,
        },
      };
    })
  );

  app.get(
    "/.z/.action:/category",
    createJSONHandler(async function postAction({
      params: { category },
    }: Request) {
      const categoryActions =
        ActionRegistry[category as keyof typeof ActionRegistry];
      if (!categoryActions)
        throw new NotFoundError(
          "NotFound",
          `Action category "${category}" not found`,
          { category }
        );
      const publicActions = Object.fromEntries(
        Object.keys(categoryActions).map((actionName) => {
          const actionDef = categoryActions[
            actionName as keyof typeof categoryActions
          ] as undefined | ActionDefinition<any, any>;
          return [
            actionName,
            {
              payloadSchema: actionDef?.payloadSchema,
            },
          ];
        })
      );
      return {
        response: { actions: publicActions },
      };
    })
  );

  app.post(
    "/.z/.action",
    json(),
    createJSONHandler(async function postAction({ body }: Request) {
      const actionDef = AllActions[body.type];
      if (!actionDef)
        throw new NotFoundError(
          "NotFound",
          `Action with type "${body.type}" could not be found`,
          { type: body.type }
        );
      const result = await actionDef.handleUnsafe(body.payload);
      return {
        response: {
          result,
        },
      };
    })
  );

  app.get(
    "/.z/.eval/*",
    createJSONHandler(async function getEval({
      params: { 0: evalPath },
    }: Request) {
      return {
        response: await data.getEval(evalPath),
      };
    })
  );

  app.get(
    "/.z/.module",
    createJSONHandler(async function getRef() {
      return { response: { modules: Object.keys(zModules) } };
    })
  );

  app.get(
    "/.z/.module/:moduleName",
    createJSONHandler(async function getRef({
      params: { moduleName },
    }: Request) {
      const module = zModules[moduleName];
      if (!module)
        throw new NotFoundError(
          "NotFound",
          `Module "${moduleName}" Not Found`,
          { moduleName }
        );
      return {
        response: {
          moduleName,
          stateSchema: module.state.schema,
          actions: Object.fromEntries(
            Object.entries(module.actions).map(
              ([actionName, action]: [string, any]) => {
                return [actionName, { payloadSchema: action.payloadSchema }];
              }
            )
          ),
        },
      };
    })
  );

  app.get(
    "/.z/:docName",
    createJSONHandler(async function getRef({ params: { docName } }: Request) {
      const doc = await data.getDoc(docName);
      if (doc.value === undefined) {
        throw new NotFoundError(
          "NotFoundError",
          `Doc "${docName}" could not be found.`,
          { docName }
        );
      }
      return {
        response: doc,
      };
    })
  );

  await new Promise<void>((resolve, reject) => {
    app.listen(context.port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      resolve();
    });
  });
}
