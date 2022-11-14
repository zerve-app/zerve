import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { CacheOptions } from "./Cache";
import { NullSchema } from "./JSONSchema";
import { ZObservable } from "./Observable";

export type ModuleSpec = {
  module?: string;
  npmDependencies?: Record<string, string>;
};

export type ZCommonMeta = {
  title: string;
  icon: string;
};

export type ZActionMeta = ZCommonMeta & {};

export type ZAction<
  ActionSchema extends JSONSchema,
  ResponseSchema extends JSONSchema,
> = {
  zType: "Action";
  payloadSchema: ActionSchema;
  responseSchema: ResponseSchema;
  call: (
    payload: FromSchema<ActionSchema>,
  ) => Promise<FromSchema<ResponseSchema>>;
  meta: ZActionMeta | undefined;
};

export type ZContainer<Zeds extends Record<string, any>> = {
  zType: "Container";
  z: Zeds;
  meta: ZContainerMeta | undefined;
  get: <S extends keyof Zeds>(zedKey: S) => Promise<Zeds[S]>;
};

export type AnyZContainer = {
  zType: "Container";
  z: Record<string, any>;
  meta: ZContainerMeta;
  get: (zedKey: any) => Promise<any>;
};

export type ZAuthContainer<Zeds extends Record<string, AnyZed>> = {
  zType: "AuthContainer";
  getAuthZed: (authId: string, authKey: string) => Promise<Zeds>;
};

export type AnyZAuthContainer = {
  zType: "AuthContainer";
  getAuthZed: (authId: string, authKey: string) => Promise<Record<string, any>>;
};

export type ZGroupMeta = ZCommonMeta & {};

export type ZGroup<
  ChildZed extends AnyZed,
  GetOptions,
  GetSchema extends JSONSchema,
> = {
  zType: "Group";
  getChild: (zedKey: string) => Promise<ChildZed | undefined>;
  get: (options: GetOptions) => Promise<FromSchema<GetSchema>>;
  valueSchema: GetSchema;
  meta: ZGroupMeta | undefined;
};

export type AnyZGroup = {
  zType: "Group";
  getChild: (zedKey: string) => Promise<any | undefined>;
  get: (options: any) => Promise<any>;
  valueSchema: JSONSchema;
  meta: ZGroupMeta | undefined;
};

export type ZGettable<GetSchema extends JSONSchema, GetOptions> = {
  zType: "Gettable";
  valueSchema: GetSchema;
  get: (options: GetOptions) => Promise<FromSchema<GetSchema>>;
  meta: ZGettableMeta | undefined;
};

export type ZStatic<Value> = {
  zType: "Static";
  value: Value;
};

export function zAnnotateCache<AnyZed>(z: AnyZed, cacheOptions: CacheOptions) {
  return {
    zType: "ZAnnotateCache",
    z,
    cacheOptions,
  };
}

export const AnySchema = {} as const;

export type AnyZed =
  | ZAction<JSONSchema, JSONSchema>
  | AnyZContainer
  | AnyZAuthContainer
  | AnyZGroup
  | ZGettable<JSONSchema, any>
  | ZObservable<JSONSchema>
  | ZStatic<any>;

export function createZAction<
  ActionSchema extends JSONSchema,
  ResponseSchema extends JSONSchema,
>(
  payloadSchema: ActionSchema,
  responseSchema: ResponseSchema,
  call: (
    payload: FromSchema<ActionSchema>,
  ) => Promise<FromSchema<ResponseSchema>>,
  meta?: ZActionMeta,
): ZAction<ActionSchema, ResponseSchema> {
  return { zType: "Action", payloadSchema, responseSchema, call, meta };
}

export type ZGettableMeta = {};

export function createZGettable<StateSchema extends JSONSchema, GetOptions>(
  valueSchema: StateSchema,
  get: (o: GetOptions) => Promise<FromSchema<StateSchema>>,
  meta?: ZGettableMeta,
): ZGettable<StateSchema, GetOptions> {
  return { zType: "Gettable", get, valueSchema, meta };
}

export function createZContainer<Zeds extends Record<string, any>>(
  z: Zeds,
): ZContainer<Zeds> {
  return {
    zType: "Container",
    z,
    meta: undefined,
    get: async (zedKey) => {
      if (zedKey.constructor === Symbol)
        throw new Error("Cannot look up Symbol in ZContainer");
      if (typeof zedKey === "number")
        throw new Error("Cannot look up number in ZContainer");
      if (z[zedKey] === undefined)
        throw new Error(`Cannot find ${String(zedKey)} in Zeds`);
      return z[zedKey];
    },
  };
}

export type ZContainerMeta = ZCommonMeta & {
  zContract?: "Auth" | "State" | "Store";
  zIndex?: string[];
  zMain?: string[];
};

export function createZMetaContainer<Zeds extends Record<string, AnyZed>>(
  z: Zeds,
  meta: ZContainerMeta | undefined,
): ZContainer<Zeds> {
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
  getAuthZed: (authId: string, authKey: string) => Promise<AuthZed>,
): ZAuthContainer<AuthZed> {
  return {
    zType: "AuthContainer",
    getAuthZed,
  };
}

export function createZGroup<ChildZType extends AnyZed>(
  getChild: (key: string) => Promise<ChildZType | undefined>,
): ZGroup<ChildZType, undefined, typeof NullSchema> {
  return {
    zType: "Group",
    valueSchema: NullSchema,
    getChild,
    get: async () => null,
    meta: undefined,
  };
}

export const RedirectSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    zContract: { const: "Redirect" },
    replace: { type: "boolean" },
    path: { type: "array", items: { type: "string" } },
  },
  required: ["zContract", "path"],
} as const;

export const PathSchema = {
  type: "array",
  items: {
    type: "string",
  },
} as const;

export const InvalidateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    zContract: { const: "Invalidate" },
    paths: { type: "array", items: PathSchema },
  },
  required: ["zContract", "paths"],
} as const;

export const ActionResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    zContract: { const: "Response" },
    redirect: RedirectSchema,
    invalidate: InvalidateSchema,
  },
  required: ["zContract"],
} as const;

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
  get: (getOptions: ChildrenListOptions) => Promise<ChildrenList>,
  meta?: ZGroupMeta,
): ZGettableGroup<ChildZType> {
  return {
    zType: "Group",
    valueSchema: ChildrenListSchema,
    getChild,
    get,
    meta,
  };
}

export function createZStatic<V>(value: V): ZStatic<V> {
  return { zType: "Static", value };
}
