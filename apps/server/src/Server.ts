import { ActionDefinition, NotFoundError } from "@zerve/core";
import { json } from "body-parser";
import express, { Request, Response } from "express";
import { createAuth } from "./Auth";

import { createCoreData } from "./CoreData";
import { createServerContext } from "./ServerContext";

function createJSONHandler(
  handler: (req: Request) => Promise<{ response: any }>
) {
  return (req: Request, res: Response) => {
    handler(req)
      .then(({ response }) => {
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
  };
}

export async function createApp(port: number, overrideDataDir?: string) {
  const app = express();

  app.use((req, res, next) => {
    // todo proper cors policy
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  const context = await createServerContext(port, overrideDataDir);

  const data = createCoreData(context);

  const auth = createAuth(data);

  const ActionRegistry = {
    CoreData: data.actions,
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
      response: {
        ".blocks": null,
        ".docs": null,
        ".action": null,
      },
    }))
  );
  app.get(
    "/.blocks",
    createJSONHandler(async function listBlocks() {
      return { response: await data.listBlocks() };
    })
  );

  app.use("/.blocks", express.static(context.blocksDir));

  app.get(
    "/.docs",
    createJSONHandler(async function listDocs() {
      return { response: await data.listDocs() };
    })
  );
  app.get(
    "/.docs/:docName",
    createJSONHandler(async function getRef({ params: { docName } }: Request) {
      return {
        response: await data.getDoc(docName),
      };
    })
  );
  app.get(
    "/.eval/*",
    createJSONHandler(async function getEval({
      params: { 0: evalPath },
    }: Request) {
      return {
        response: await data.getEval(evalPath),
      };
    })
  );

  app.get(
    "/.action",
    createJSONHandler(async function postAction({}: Request) {
      return {
        response: {
          children: ActionRegistryGroups,
        },
      };
    })
  );

  app.get(
    "/.action/:category",
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
    "/.action",
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

  await new Promise<void>((resolve, reject) => {
    app.listen(context.port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      resolve();
    });
  });
}
