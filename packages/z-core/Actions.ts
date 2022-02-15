import { JSONSchema } from "json-schema-to-ts";

export type ActionDefinition = {
  payloadSchema: JSONSchema;
};

export function createActionSet<
  Actions extends Readonly<Record<string, ActionDefinition>>,
  SetName extends string
>(setName: SetName, actions: Actions) {
  function dispatch<ActionType extends string>(action: {
    type: `${SetName}/${ActionType}`;
    payload: Actions[ActionType];
  }) {}
  return {
    setName,
    actions,
    dispatch,
  };
}
