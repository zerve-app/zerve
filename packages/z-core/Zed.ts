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

export type ZContainer<Zeds extends Record<string, AnyZed>> = {
  zType: "Container";
  z: Zeds;
  get: <S extends keyof Zeds>(zedKey: S) => Promise<Zeds[S]>;
};

export type ZGroup<ChildZed extends AnyZed, GetOptions, GetResponse> = {
  zType: "Group";
  getChild: (zedKey: string) => Promise<ChildZed | undefined>;
  get: (options: GetOptions) => Promise<GetResponse>;
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

export type AnyZed =
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

export function createZContainer<Zeds extends Record<string, AnyZed>>(
  z: Zeds
): ZContainer<Zeds> {
  return {
    zType: "Container",
    z,
    get: async (zedKey) => {
      if (z[zedKey] === undefined)
        throw new Error(`Cannot find ${zedKey} in Zeds`);
      return z[zedKey];
    },
  };
}

export function createZGroup<ChildZType extends AnyZed>(
  getChild: (key: string) => Promise<ChildZType | undefined>
): ZGroup<ChildZType, undefined, null> {
  return {
    zType: "Group",
    getChild,
    get: async () => null,
  };
}

export function createZGettableGroup<
  ChildZType extends AnyZed,
  GetOptions,
  GetResponse
>(
  getChild: (key: string) => Promise<ChildZType | undefined>,
  get: (options: GetOptions) => Promise<GetResponse>
): ZGroup<ChildZType, GetOptions, GetResponse> {
  return {
    zType: "Group",
    getChild,
    get,
  };
}

export function createZStatic<V>(value: V): ZStatic<V> {
  return { zType: "Static", value };
}
