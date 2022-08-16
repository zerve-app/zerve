import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ModuleSpec = {
  module?: string;
  npmDependencies?: Record<string, string>;
};

export type ZAction<
  ActionSchema extends JSONSchema,
  ResponseSchema extends JSONSchema
> = {
  zType: "Action";
  payloadSchema: ActionSchema;
  responseSchema: ResponseSchema;
  call: (
    payload: FromSchema<ActionSchema>
  ) => Promise<FromSchema<ResponseSchema>>;
};

export type ZContainer<Zeds extends Record<string, AnyZed>, Meta> = {
  zType: "Container";
  z: Zeds;
  meta: Meta;
  get: <S extends keyof Zeds>(zedKey: S) => Promise<Zeds[S]>;
};

export type ZAuthContainer<Zeds extends Record<string, AnyZed>> = {
  zType: "AuthContainer";
  getAuthZed: (authId: string, authKey: string) => Promise<Zeds>;
};

export type ZGroup<
  ChildZed extends AnyZed,
  GetOptions,
  GetSchema extends JSONSchema
> = {
  zType: "Group";
  getChild: (zedKey: string) => Promise<ChildZed | undefined>;
  get: (options: GetOptions) => Promise<FromSchema<GetSchema>>;
  valueSchema: GetSchema;
};

export type ZGettable<GetSchema extends JSONSchema, GetOptions> = {
  zType: "Gettable";
  valueSchema: GetSchema;
  get: (options: GetOptions) => Promise<FromSchema<GetSchema>>;
};

export type ZStatic<Value> = {
  zType: "Static";
  value: Value;
};

export const AnySchema = {} as const;

export type AnyZed =
  | ZAction<any, any>
  | ZContainer<any, any>
  | ZAuthContainer<any>
  | ZGroup<any, any, any>
  | ZGettable<any, any>
  | ZStatic<any>;

export function createZAction<
  ActionSchema extends JSONSchema,
  ResponseSchema extends JSONSchema
>(
  payloadSchema: ActionSchema,
  responseSchema: ResponseSchema,
  call: (
    payload: FromSchema<ActionSchema>
  ) => Promise<FromSchema<ResponseSchema>>
): ZAction<ActionSchema, ResponseSchema> {
  return { zType: "Action", payloadSchema, responseSchema, call };
}

export function createZGettable<StateSchema extends JSONSchema, GetOptions>(
  valueSchema: StateSchema,
  get: (o: GetOptions) => Promise<FromSchema<StateSchema>>
): ZGettable<StateSchema, GetOptions> {
  return { zType: "Gettable", get, valueSchema };
}

export function createZContainer<Zeds extends Record<string, AnyZed>>(
  z: Zeds
): ZContainer<Zeds, undefined> {
  return {
    zType: "Container",
    z,
    meta: undefined,
    get: async (zedKey: string | number | Symbol) => {
      if (zedKey.constructor === Symbol)
        throw new Error("Cannot look up Symbol in ZContainer");
      if (typeof zedKey === "number")
        throw new Error("Cannot look up number in ZContainer");
      if (z[zedKey] === undefined)
        throw new Error(`Cannot find ${zedKey} in Zeds`);
      return z[zedKey];
    },
  };
}

type ContainerMeta = {
  zContract?: string;
  index?: string;
  main?: string;
};

export function createZMetaContainer<
  Zeds extends Record<string, AnyZed>,
  Meta extends ContainerMeta
>(z: Zeds, meta: Meta): ZContainer<Zeds, Meta> {
  return {
    zType: "Container",
    z,
    meta,
    get: async (zedKey) => {
      if (z[zedKey] === undefined)
        throw new Error(`Cannot find "${String(zedKey)}" in Zeds`);
      return z[zedKey];
    },
  };
}

export function createZAuthContainer<AuthZed extends Record<string, AnyZed>>(
  getAuthZed: (authId: string, authKey: string) => Promise<AuthZed>
): ZAuthContainer<AuthZed> {
  return {
    zType: "AuthContainer",
    getAuthZed,
  };
}

const NullSchema = { type: "null" } as const;
export function createZGroup<ChildZType extends AnyZed>(
  getChild: (key: string) => Promise<ChildZType | undefined>
): ZGroup<ChildZType, undefined, typeof NullSchema> {
  return {
    zType: "Group",
    valueSchema: NullSchema,
    getChild,
    get: async () => null,
  };
}

export const ChildrenListSchema = {
  type: "object",
  required: ["children", "more", "cursor"],
  properties: {
    children: { type: "array", items: { type: "string" } },
    more: { type: "boolean" },
    cursor: { type: "string" },
  },
  additionalProperties: false,
} as const;
export type ChildrenList = FromSchema<typeof ChildrenListSchema>;

export const ChildrenListOptionsSchema = {
  type: "object",
  required: [],
  properties: {
    query: { type: "string" },
    cursor: { type: "string" },
    reverse: { type: "boolean" },
  },
  additionalProperties: false,
} as const;
export type ChildrenListOptions = FromSchema<typeof ChildrenListOptionsSchema>;

export type ZGettableGroup<ChildZType extends AnyZed> = ZGroup<
  ChildZType,
  ChildrenListOptions,
  typeof ChildrenListSchema
>;

export function createZGettableGroup<ChildZType extends AnyZed>(
  getChild: (key: string) => Promise<ChildZType | undefined>,
  get: (getOptions: ChildrenListOptions) => Promise<ChildrenList>
): ZGettableGroup<ChildZType> {
  return {
    zType: "Group",
    valueSchema: ChildrenListSchema,
    getChild,
    get,
  };
}

export function createZStatic<V>(value: V): ZStatic<V> {
  return { zType: "Static", value };
}
