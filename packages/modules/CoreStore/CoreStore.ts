import {
  createZContainer,
  ajv,
  createZGettableGroup,
  FromSchema,
  JSONSchema,
  RequestError,
  createZAction,
  AnySchema,
  getValidatorOfSchema,
  ZSchemaSchema,
} from "@zerve/core";
import CoreChain, { createZChainStateCalculator } from "../CoreChain/CoreChain";
import { CoreDataModule } from "../CoreData/CoreData";
import { SystemFilesModule } from "../SystemFiles/SystemFiles";

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
    name: { type: "string" },
    value: {},
  },
  additionalProperties: false,
  required: ["name", "value"],
} as const;

const DeleteActionSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  additionalProperties: false,
  required: ["name"],
} as const;

const WriteSchemaValueActionSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    schema: {},
    value: {},
  },
  additionalProperties: false,
  required: ["name", "schema"],
} as const;

const WriteSchemaActionSchema = {
  type: "object",
  properties: {
    schemaName: { type: "string" },
    schema: {},
  },
  additionalProperties: false,
  required: ["schemaName", "schema"],
} as const;

function validateNode(node: FromSchema<typeof NodeSchema>) {
  if (typeof node !== "object") throw new Error("Invalid Store Node");
  if (node.value === undefined) throw new Error("Store Node value missing");
  if (node.schema === null) {
    return;
  }
  const validate = getValidatorOfSchema(node.schema);
  const isValid = validate(node.value);
  if (!isValid) {
    throw new RequestError(
      "ValidationError",
      `Invalid: ${validate.errors[0].message}`,
      {
        errors: validate.errors,
      }
    );
  }
}

const GenericCalculator = createZChainStateCalculator(
  StateTreeSchema,
  {},
  {
    WriteValue: {
      schema: WriteValueActionSchema,
      handler: (
        state: FromSchema<typeof StateTreeSchema>,
        action: FromSchema<typeof WriteValueActionSchema>
      ) => {
        const { name, value } = action;
        if (name[0] === "$")
          throw new Error("Cannot write to a hidden file that begins with $");
        const prevNode = state[name];
        const node = {
          ...(prevNode || {}),
          value,
        };
        console.log("WriteValue validateNode", node);
        validateNode(node);
        return {
          ...state,
          [name]: node,
        };
      },
    },
    WriteSchemaValue: {
      schema: WriteSchemaValueActionSchema,
      handler: (
        state: FromSchema<typeof StateTreeSchema>,
        action: FromSchema<typeof WriteSchemaValueActionSchema>
      ) => {
        const { name, schema, value } = action;
        if (name[0] === "$")
          throw new Error("Cannot write to a hidden file that begins with $");
        const prevNode = state[name];
        const node = {
          schema: schema,
          value: value === undefined ? prevNode?.value || null : action.value,
        };
        validateNode(node);
        return {
          ...state,
          [name]: node,
        };
      },
    },
    Delete: {
      schema: DeleteActionSchema,
      handler: (
        state: FromSchema<typeof StateTreeSchema>,
        action: FromSchema<typeof DeleteActionSchema>
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
        action: FromSchema<typeof WriteSchemaActionSchema>
      ) => {
        const schemas = state.$schemas || {};
        schemas[action.schemaName] = action.schema;
        return {
          ...state,
          $schemas: schemas,
        };
      },
    },
  }
);

async function createGeneralStore(
  data: CoreDataModule,
  cacheFiles: SystemFilesModule,
  docName: string
) {
  const genStore = await CoreChain.createZChainState(
    data,
    cacheFiles,
    docName,
    GenericCalculator
  );

  async function validateWriteValue(
    input: FromSchema<typeof WriteValueActionSchema>
  ): Promise<void> {
    const storeNode = await genStore.z.State.getChild(input.name);
    const storeNodeValue = await storeNode.get();
    if (storeNodeValue.schema != null) {
      const validator = getValidatorOfSchema(storeNodeValue.schema);
      const isValid = validator(input.value);
      if (!isValid)
        throw new RequestError("ValidationError", `Invalid`, {
          errors: validator.errors,
        });
    }
  }

  async function validateWriteSchemaValue(
    input: FromSchema<typeof WriteValueActionSchema>
  ): Promise<void> {
    if (input.value === undefined) {
      const storeNode = await genStore.z.State.getChild(input.name);
      const storeNodeValue = await storeNode.get();
      if (input.schema != null) {
        const validator = getValidatorOfSchema(input.schema);
        const isValid = validator(storeNodeValue.value);
        if (!isValid)
          throw new RequestError("ValidationError", `Invalid`, {
            errors: validator.errors,
          });
      }
    } else {
      const validator = getValidatorOfSchema(input.schema);
      const isValid = validator(input.value);
      if (!isValid)
        throw new RequestError("ValidationError", `Invalid`, {
          errors: validator.errors,
        });
    }
  }

  const Dispatch = createZAction(
    genStore.z.Dispatch.payloadSchema,
    genStore.z.Dispatch.responseSchema,
    async (action) => {
      if (action.name === "WriteValue") await validateWriteValue(action.value);
      if (action.name === "WriteSchemaValue")
        await validateWriteSchemaValue(action.value);

      return await genStore.z.Dispatch.call(action);
    }
  );

  return createZContainer({
    ...genStore.z,
    Dispatch,
  });
}

const CoreStore = {
  createGeneralStore,
};
export default CoreStore;
