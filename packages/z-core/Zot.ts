import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ModuleSpec = {
  module?: string;
  npmDependencies?: Record<string, string>;
};

export type ZAction<ActionSchema extends JSONSchema, ActionResponse> = {
  zType: "Action";
  payloadSchema: ActionSchema;
  call: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>;
};

export type ZContainer<Zots extends Record<string, AnyZot>> = {
  zType: "Container";
  zots: Zots;
  get: <S extends keyof Zots>(zotKey: S) => Promise<Zots[S]>;
};

export type ZGroup<ChildZot extends AnyZot, ListOptions, ListResponse> = {
  zType: "Group";
  getChild: (zotKey: string) => Promise<ChildZot | undefined>;
  get: (options: ListOptions) => Promise<ListResponse>;
};

export type ZGettable<StateSchema extends JSONSchema, GetOptions> = {
  zType: "Gettable";
  valueSchema: StateSchema;
  get: (options: GetOptions) => Promise<FromSchema<StateSchema>>;
};

export type ZStatic<Value> = {
  zType: "Static";
  value: Value;
};

export type AnyZot =
  | ZAction<any, any>
  | ZContainer<any>
  | ZGroup<any, any, any>
  | ZGettable<any, any>
  | ZStatic<any>;

export function createZAction<ActionSchema extends JSONSchema, ActionResponse>(
  payloadSchema: ActionSchema,
  call: (payload: FromSchema<ActionSchema>) => Promise<ActionResponse>
): ZAction<ActionSchema, ActionResponse> {
  return { zType: "Action", payloadSchema, call };
}

export function createZGettable<StateSchema, GetOptions>(
  valueSchema: StateSchema,
  get: (o: GetOptions) => Promise<FromSchema<StateSchema>>
): ZGettable<StateSchema, GetOptions> {
  return { zType: "Gettable", get, valueSchema };
}

export function createZContainer<Zots extends Record<string, AnyZot>>(
  zots: Zots
): ZContainer<Zots> {
  return {
    zType: "Container",
    zots,
    get: async (zotKey) => {
      if (zots[zotKey] === undefined)
        throw new Error(`Cannot find ${zotKey} in Zots`);
      return zots[zotKey];
    },
  };
}

export function createZGroup<ChildZotType extends AnyZot>(
  getChild: (key: string) => Promise<ChildZotType | undefined>
): ZGroup<ChildZotType, undefined, undefined> {
  return {
    zType: "Group",
    getChild,
    get: () => null,
  };
}

export function createZListableGroup<
  ChildZotType extends AnyZot,
  ListOptions,
  ListResponse
>(
  getChild: (key: string) => Promise<ChildZotType | undefined>,
  getList: (options: ListOptions) => Promise<ListResponse>
): ZGroup<ChildZotType, ListOptions, ListResponse> {
  return {
    zType: "Group",
    getChild,
    get: getList,
  };
}

export function createZStatic<V>(value: V): ZStatic<V> {
  return { zType: "Static", value };
}
