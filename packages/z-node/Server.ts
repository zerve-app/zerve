import { Request, Response } from "express";

export function createJSONHandler(
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
