import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ModuleSpec = {
  module?: string;
  npmDependencies?: Record<string, string>;
};

export type ActionZot<ActionSchema extends JSONSchema, ActionResponse> = {
  zType: "Action";
  payloadSchema: ActionSchema;
  call: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>;
};

export type StaticContainerZot<Zots extends Record<string, AnyZot>> = {
  zType: "StaticContainer";
  zots: Zots;
  get: <S extends keyof Zots>(zotKey: S) => Promise<Zots[S]>;
};

export type ContainerZot<ChildZot extends AnyZot> = {
  zType: "Container";
  get: (zotKey: string) => Promise<ChildZot | undefined>;
};

export type GetZot<StateSchema extends JSONSchema, GetOptions> = {
  zType: "Get";
  valueSchema: StateSchema;
  get: (options: GetOptions) => Promise<FromSchema<StateSchema>>;
};

export type AnyZot =
  | ActionZot<any, any>
  | StaticContainerZot<any>
  | ContainerZot<any>
  | GetZot<any, any>;

export function defineActionZot<
  ActionSchema extends JSONSchema,
  ActionResponse
>(
  payloadSchema: ActionSchema,
  call: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>
): ActionZot<ActionSchema, ActionResponse> {
  return { zType: "Action", payloadSchema, call };
}

export function defineGetZot<StateSchema, GetOptions>(
  valueSchema: StateSchema,
  get: (o: GetOptions) => Promise<FromSchema<StateSchema>>
): GetZot<StateSchema, GetOptions> {
  return { zType: "Get", get, valueSchema };
}

export function defineStaticContainerZot<Zots extends Record<string, AnyZot>>(
  zots: Zots
): StaticContainerZot<Zots> {
  return {
    zType: "StaticContainer",
    zots,
    get: async (zotKey) => {
      if (zots[zotKey] === undefined)
        throw new Error(`Cannot find ${zotKey} in Zots`);
      return zots[zotKey];
    },
  };
}

export function defineContainerZot<ChildZotType extends AnyZot>(
  getChildZot: (key: string) => Promise<ChildZotType | undefined>
): ContainerZot<ChildZotType> {
  return {
    zType: "Container",
    get: getChildZot,
  };
}
