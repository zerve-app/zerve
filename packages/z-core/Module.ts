import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ModuleSpec = {
  actions?: string;
  state?: string;
  npmDependencies?: Record<string, string>;
};

type ModuleDefinition<
  S extends JSONSchema,
  A extends Record<string, ModuleActionDefinition<any, any>>
> = {
  name: string;
  spec: ModuleSpec;
  state: ModuleStateDefinition<S>;
  actions: A;
};

type ModuleStateDefinition<Schema extends JSONSchema> = {
  schema: Schema;
};
type ModuleActionDefinition<ActionSchema extends JSONSchema, ActionResponse> = {
  payloadSchema: ActionSchema;
  handler: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>;
};

export function defineModule<
  S extends JSONSchema,
  // A extends Record<string, ModuleActionDefinition<any, any>>
  A
>(
  name: string,
  spec: ModuleSpec,
  state: ModuleStateDefinition<S>,
  actions: A
): ModuleDefinition<S, A> {
  return { name, spec, state, actions };
}

export function defineModuleState<Schema extends JSONSchema>(
  schema: Schema
): ModuleStateDefinition<Schema> {
  return { schema };
}

export function defineModuleAction<
  ActionSchema extends JSONSchema,
  ActionResponse
>(
  payloadSchema: ActionSchema,
  handler: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>
): ModuleActionDefinition<ActionSchema, ActionResponse> {
  return { payloadSchema, handler };
}
