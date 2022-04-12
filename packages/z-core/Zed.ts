import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { ZObservable } from "./Observable";

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

export type ZContainer<Zeds extends Record<string, any>> = {
  zType: "Container";
  z: Zeds;
  get: <S extends keyof Zeds>(zedKey: S) => Promise<Zeds[S]>;
};

export type AnyZContainer = {
  zType: "Container";
  z: Record<string, any>;
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

export type AnyZGroup = {
  zType: "Group";
  getChild: (zedKey: string) => Promise<any | undefined>;
  get: (options: any) => Promise<any>;
  valueSchema: JSONSchema;
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
  | ZAction<JSONSchema, JSONSchema>
  | AnyZContainer
  | AnyZAuthContainer
  | AnyZGroup
  | ZGettable<JSONSchema, any>
  | ZObservable<JSONSchema>
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

export function createZContainer<Zeds extends Record<string, any>>(
  z: Zeds
): ZContainer<Zeds> {
  return {
    zType: "Container",
    z,
    get: async (zedKey) => {
      if (z[zedKey] === undefined)
        throw new Error(`Cannot find ${String(zedKey)} in Zeds`);
      return z[zedKey];
    },
  };
}

export function createZAuthContainer<AuthZed extends AnyZed>(
  getAuthZed: (authId: string, authKey: string) => Promise<AuthZed>
  // There is a legit error below, ZAuthContainer expects Record<string, AnyZed>
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

export function createZGettableGroup<
  GetSchema extends JSONSchema,
  ChildZType extends AnyZed,
  GetOptions
>(
  valueSchema: GetSchema,
  getChild: (key: string) => Promise<ChildZType | undefined>,
  get: (options: GetOptions) => Promise<FromSchema<GetSchema>>
): ZGroup<ChildZType, GetOptions, GetSchema> {
  return {
    zType: "Group",
    valueSchema,
    getChild,
    get,
  };
}

export function createZStatic<V>(value: V): ZStatic<V> {
  return { zType: "Static", value };
}
