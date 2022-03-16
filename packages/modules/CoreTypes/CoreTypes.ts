import { FromSchema, GenericError } from "@zerve/core";
import { createZChainStateCalculator } from "../CoreChain/CoreChain";

const CoreTypesStateSchema = {
  type: "object",
  additionalProperties: false,
  required: ["types"],
  properties: {
    types: {
      type: "object",
      additionalProperties: {
        /* JSON SCHEMA */
      },
    },
  },
} as const;

export type CoreTypesState = FromSchema<typeof CoreTypesStateSchema>;

const defaultTypesState: CoreTypesState = { types: {} };

const SetTypeActionSchema = {
  title: "Inject Value",
  type: "object",
  properties: {
    schema: {},
    name: { type: "string" },
  },
  required: ["schema", "name"],
  additionalProperties: false,
} as const;

const CoreTypesCalculator = createZChainStateCalculator(
  CoreTypesStateSchema,
  defaultTypesState,
  {
    SetTypeAction: {
      schema: SetTypeActionSchema,
      handler: (
        state: CoreTypesState,
        action: FromSchema<typeof SetTypeActionSchema>
      ) => {
        return {
          types: {
            ...state.types,
            [action.name]: action.schema,
          },
        };
      },
    },
  }
);

const CoreTypes = {
  CoreTypesCalculator,
};

export default CoreTypes;
