import { json } from "body-parser";
import express, { Request, Response } from "express";

import { createCoreData, createServerContext } from "./CoreData";

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

export async function createApp(port: number, overrideAgentDir?: string) {
  const app = express();
  const context = await createServerContext(port, overrideAgentDir);
  const data = createCoreData(context);

  app.get(
    "/",
    createJSONHandler(async () => ({
      response: {
        ".blocks": null,
        ".refs": null,
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
    "/.refs",
    createJSONHandler(async function listRefs() {
      return { response: await data.listRefs() };
    })
  );
  app.get(
    "/.refs/:refName",
    createJSONHandler(async function getRef({ params: { refName } }: Request) {
      return {
        response: await data.getRef(refName),
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
