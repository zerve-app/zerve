import { defineAction } from "@zerve/core";
import { DataBase } from "./DataBase";

export function createAuth(data: DataBase) {
  const IntroduceUser = defineAction(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        publicKey: { type: "string" },
        signature: { type: "string" },
      },
      required: ["name", "publicKey", "signature"],
      additionalProperties: false,
    } as const,
    async ({ name, publicKey, signature }) => {
      console.log("EXAMPLE USER STUFF HERE");
    }
  );
  return {
    actions: { IntroduceUser },
  };
}
