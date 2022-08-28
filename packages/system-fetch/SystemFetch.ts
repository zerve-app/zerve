import { createZAction } from "@zerve/zed";

const Fetch = createZAction(
  {
    type: "object",
    required: ["httpsHost", "path"],
    additionalProperties: false,
    properties: {
      httpsHost: { type: "string" },
      path: { type: "string" },
      query: { type: "object", additionalProperties: { type: "string" } },
      method: { enum: ["post", "get", "put", "delete", "options"] },
      jsonBody: {},
    },
  } as const,
  {} as const,
  async ({ httpsHost, path, query, jsonBody, method }) => {
    console.log("Fetch", { httpsHost, path, method, query, jsonBody });
    const resp = await fetch(`htttps://${httpsHost}${path}`, {
      method,
      body: jsonBody == null ? undefined : JSON.stringify(jsonBody),
    });
  },
);

export type FetchModule = typeof Fetch;

const SystemFetch = {
  Fetch,
};

export default SystemFetch;
