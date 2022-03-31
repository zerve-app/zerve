import { createZAction, createZContainer, FromSchema } from "@zerve/core";

const CaddySpecSchema = {
  type: "object",
  additionalProperties: false,
  required: ["hosts"],
  properties: {
    hosts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["hostname"],
        properties: {
          hostname: {
            type: "string",
          },
        },
      },
    },
  },
} as const;

export type CaddyConfig = FromSchema<typeof CaddySpecSchema>;

const ApplySystemConfig = createZAction(
  CaddySpecSchema,
  { type: "object", additionalProperties: false } as const,

  async (spec) => {
    console.log("LOL", spec);
    return {};
  }
);

const SystemCaddy = createZContainer({
  ApplySystemConfig,
});

export type SystemCaddyModule = ReturnType<typeof SystemCaddy>;

export default SystemCaddy;
