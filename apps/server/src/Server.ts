import { json } from "body-parser";
import express, { Request, Response } from "express";

import { Actions } from "./actions";
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
        res.status(e.status || 500).send(
          JSON.stringify({
            message: e.message,
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

  async function onNextDispatch(
    anonActionType: keyof typeof Actions,
    anonActionPayload: any
  ) {
    const actionDef = Actions[anonActionType];
    if (!actionDef) {
      return;
    }
    await actionDef.call(anonActionPayload);
  }

  const data = createCoreData(context, onNextDispatch);

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
          children: {},
        },
      };
    })
  );

  app.post(
    "/.action",
    json(),
    createJSONHandler(async function postAction({ body }: Request) {
      const result = await data.dispatch(body.type, body.payload);
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
