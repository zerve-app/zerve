import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ActionDefinition<Schema extends JSONSchema, Returns> = {
  payloadSchema: Schema;
  handle: (payload: FromSchema<Schema>) => Promise<Returns>;
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
  return {
    payloadSchema,
    handle,
    description,
  };
}
