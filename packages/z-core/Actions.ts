import { FromSchema, JSONSchema } from "json-schema-to-ts";
import Ajv from "ajv";
import { RequestError } from "./Errors";

const ajv = Ajv();

export type ActionDefinition<Schema extends JSONSchema, Returns> = {
  payloadSchema: Schema;
  handle: (payload: FromSchema<Schema>) => Promise<Returns>;
  handleUnsafe: (payload: any) => Promise<Returns>;
  description?: string;
};

export type ActionSet = Record<string, ActionDefinition<any, any>>;

// export function createActionSet(
//   setName: string,
//   actions:
// ) {
//   async function dispatch<ActionType extends keyof typeof actions>(action: {
//     type: `${typeof setName}/${ActionType}`;
//     payload: typeof actions[ActionType];
//   }) {
//     const matchedAction = actions[action.type];
//     if (!matchedAction) throw new Error("Action not found");
//     return await matchedAction.handle(action.payload);
//   }
//   return {
//     setName,
//     actions,
//     dispatch,
//   };
// }

export function defineAction<Schema extends JSONSchema, Returns>(
  payloadSchema: Schema,
  handle: (payload: FromSchema<Schema>) => Promise<Returns>,
  description?: string
): ActionDefinition<Schema, Returns> {
  const validate = ajv.compile(payloadSchema);
  function handleUnsafe(payload: any): Promise<Returns> {
    if (!validate(payload)) {
      const validationError = validate.errors?.[0];
      throw new RequestError(
        "ValidationError",
        `Validation Error: ${validationError?.message}`,
        {
          ...validationError,
          schema: payloadSchema,
        }
      );
    }
    return handle(payload);
  }

  return {
    payloadSchema,
    handle,
    handleUnsafe,
    description,
  };
}
