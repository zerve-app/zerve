import { createZAction } from "@zerve/core";

const Fetch = createZAction(
  {
    type: "object",
    required: ["httpsHost", "path"],
    additionalProperties: false,
    properties: {
      httpsHost: { type: "string" },
      path: { type: "string" },
      query: { type: "object" },
      method: { enum: ["post", "get", "put", "delete", "options"] },
      jsonBody: {},
    },
  } as const,
  {} as const,
  async ({ httpsHost, path, query, jsonBody }) => {
    console.log("Fetch", { httpsHost, path });
    // await
  }
);

export type FetchModule = typeof Fetch;

const SystemFetch = {
  Fetch,
};

export default SystemFetch;
