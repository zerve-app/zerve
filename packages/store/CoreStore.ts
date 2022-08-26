import {
  FromSchema,
  createZAction,
  SchemaStore,
  validateWithSchemaStore,
  createZMetaContainer,
  EmptySchemaStore,
  JSONSchema,
  EntryNameSchema,
} from "@zerve/core";
import CoreChain, { createZChainStateCalculator } from "@zerve/chain";
import { CoreDataModule } from "@zerve/data";

const NodeSchema = {
  name: "StoreNode",
  type: "object",
  properties: {
    value: {},
    schema: {},
  },
  additionalProperties: false,
  required: ["value"],
} as const;

const StateTreeSchema = {
  name: "StoreState",
  type: "object",
  additionalProperties: NodeSchema,
  properties: {
    $schemas: {
      type: "object",
      additionalProperties: {},
    },
  },
} as const;

const WriteValueActionSchema = {
  type: "object",
  properties: {
    name: EntryNameSchema,
    value: {},
  },
  additionalProperties: false,
  required: ["name", "value"],
} as const;

const RenameValueActionSchema = {
  type: "object",
  properties: {
    prevName: EntryNameSchema,
    newName: EntryNameSchema,
  },
  additionalProperties: false,
  required: ["prevName", "newName"],
} as const;

const DeleteActionSchema = {
  type: "object",
  properties: {
    name: EntryNameSchema,
  },
  additionalProperties: false,
  required: ["name"],
} as const;

const WriteSchemaValueActionSchema = {
  type: "object",
  properties: {
    name: EntryNameSchema,
    schema: {},
    value: {},
  },
  additionalProperties: false,
  required: ["name", "schema"],
} as const;

const WriteSchemaActionSchema = {
  type: "object",
  properties: {
    schemaName: EntryNameSchema,
    schema: {},
  },
  additionalProperties: false,
  required: ["schemaName", "schema"],
} as const;

const DeleteSchemaActionSchema = {
  type: "object",
  properties: {
    schemaName: EntryNameSchema,
  },
  additionalProperties: false,
  required: ["schemaName"],
} as const;

const RenameSchemaActionSchema = {
  type: "object",
  properties: {
    prevName: EntryNameSchema,
    newName: EntryNameSchema,
  },
  additionalProperties: false,
  required: ["prevName", "newName"],
} as const;

function validateNode(
  node: FromSchema<typeof NodeSchema>,
  schemas: SchemaStore,
) {
  if (typeof node !== "object") throw new Error("Invalid Store Node");
  if (node.value === undefined) throw new Error("Store Node value missing");
  if (node.schema === null) {
    return;
  }
  validateWithSchemaStore(node.schema, node.value, schemas);
}

export type GeneralStoreModule = Awaited<ReturnType<typeof createGeneralStore>>;

export async function createGeneralStore(
  data: CoreDataModule,
  cacheFilesPath: string,
  docName: string,
  inputSolidSchemas?: Record<string, JSONSchema>,
) {
  const solidSchemas = Object.fromEntries(
    Object.entries(inputSolidSchemas || {}).map(([schemaName, schema]) => [
      schemaName,
      {
        ...schema,
        readOnly: true,
      },
    ]),
  );
  function handleWriteSchemaValue(
    state: FromSchema<typeof StateTreeSchema>,
    action: FromSchema<typeof WriteSchemaValueActionSchema>,
  ): FromSchema<typeof StateTreeSchema> {
    const { name, schema, value } = action;
    if (name[0] === "$")
      throw new Error("Cannot write to a hidden file that begins with $");
    const prevNode = state[name];
    const node = {
      schema: schema,
      value: value === undefined ? prevNode?.value || null : action.value,
    };
    const schemaStore = {
      ...(state.$schemas || EmptySchemaStore),
      ...solidSchemas,
    };
    validateNode(node, schemaStore);
    return {
      ...state,
      [name]: node,
    };
  }

  const GenericCalculator = createZChainStateCalculator(
    StateTreeSchema,
    {
      $schemas: {},
    },
    {
      WriteValue: {
        schema: WriteValueActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof WriteValueActionSchema>,
        ) => {
          const { name, value } = action;
          if (name[0] === "$")
            throw new Error("Cannot write to a hidden file that begins with $");
          const prevNode: NodeSchema | undefined = state[name];
          const node = {
            ...(prevNode || {}),
            value,
          };
          const schemaStore = {
            ...(state.$schemas || EmptySchemaStore),
            ...solidSchemas,
          };
          validateNode(node, schemaStore);
          return {
            ...state,
            [name]: node,
          };
        },
      },
      WriteSchemaValue: {
        schema: WriteSchemaValueActionSchema,
        handler: handleWriteSchemaValue,
      },
      CreateValue: {
        schema: WriteSchemaValueActionSchema,
        handler: handleWriteSchemaValue,
      },
      RenameValue: {
        schema: RenameValueActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof RenameValueActionSchema>,
        ) => {
          const { prevName, newName } = action;
          const newState: typeof state = { ...state };
          const value = newState[prevName];
          delete newState[prevName];
          newState[newName] = value;
          return newState;
        },
      },
      Delete: {
        schema: DeleteActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof DeleteActionSchema>,
        ) => {
          if (action.name[0] === "$")
            throw new Error("Cannot delete a hidden file that begins with $");
          const newState = { ...state };
          delete newState[action.name];
          return newState;
        },
      },
      WriteSchema: {
        schema: WriteSchemaActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof WriteSchemaActionSchema>,
        ) => {
          const schemas = state.$schemas || {};
          schemas[action.schemaName] = {
            ...action.schema,
            $id: `https://type.zerve.link/${action.schemaName}`,
          };
          return {
            ...state,
            $schemas: schemas,
          };
        },
      },
      DeleteSchema: {
        schema: DeleteSchemaActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof DeleteSchemaActionSchema>,
        ) => {
          const schemas = state.$schemas ? { ...state.$schemas } : {};
          delete schemas[action.schemaName];
          return {
            ...state,
            $schemas: schemas,
          };
        },
      },
      RenameSchema: {
        schema: RenameSchemaActionSchema,
        handler: (
          state: FromSchema<typeof StateTreeSchema>,
          action: FromSchema<typeof DeleteSchemaActionSchema>,
        ) => {
          const { prevName, newName } = action;
          const newSchemas: typeof state["$schemas"] = { ...state.$schemas };
          const value = newSchemas[prevName];
          delete newSchemas[prevName];
          newSchemas[newName] = value;
          return { ...state, $schemas: newSchemas };
        },
      },
    },
  );
  const genStore = await CoreChain.createZChainState(
    data,
    cacheFilesPath,
    docName,
    GenericCalculator,
    (storeState) =>
      solidSchemas
        ? {
            ...storeState,
            $schemas: {
              // maybe these should be reversed?:
              ...storeState.$schemas,
              ...solidSchemas,
            },
          }
        : storeState,
  );

  async function validateWriteValue(
    input: FromSchema<typeof WriteValueActionSchema>,
  ): Promise<void> {
    const storeState = await genStore.z.State.get();
    const storeNodeValue = storeState[input.name];
    const storeSchemas = storeState["$schemas"] || EmptySchemaStore;

    if (storeNodeValue.schema != null) {
      validateWithSchemaStore(storeNodeValue.schema, input.value, {
        ...storeSchemas,
        ...solidSchemas,
      });
    }
  }

  function validateWrite(
    input: FromSchema<typeof WriteSchemaValueActionSchema>,
    storeValue: any, // uh fix this
  ) {
    const storeSchemas = storeValue?.["$schemas"] || EmptySchemaStore;
    const schemaStore = { ...storeSchemas, ...solidSchemas };
    if (input.value === undefined) {
      const storeEntryValue = storeValue[input.name];
      if (input.schema != null) {
        validateWithSchemaStore(input.schema, storeEntryValue, schemaStore);
      }
    } else {
      validateWithSchemaStore(input.schema, input.value, schemaStore);
    }
  }

  async function validateWriteSchemaValue(
    input: FromSchema<typeof WriteSchemaValueActionSchema>,
  ): Promise<void> {
    const storeValue = await genStore.z.State.get();
    validateWrite(input, storeValue);
  }

  async function validateCreateValue(
    input: FromSchema<typeof WriteSchemaValueActionSchema>,
  ): Promise<void> {
    const storeValue = await genStore.z.State.get();
    if (storeValue[input.name]) {
      throw new Error(`Value named "${input.name}" already exists in store.`);
    }
    validateWrite(input, storeValue);
  }

  const Dispatch = createZAction(
    genStore.z.Dispatch.payloadSchema,
    genStore.z.Dispatch.responseSchema,
    async (action) => {
      if (action.name === "CreateValue")
        await validateCreateValue(action.value);
      if (action.name === "WriteValue") await validateWriteValue(action.value);
      if (action.name === "WriteSchemaValue")
        await validateWriteSchemaValue(action.value);
      return await genStore.z.Dispatch.call(action);
    },
  );

  return createZMetaContainer(
    {
      ...genStore.z,
      Dispatch,
    },
    {
      zContract: "Store",
    },
  );
}
