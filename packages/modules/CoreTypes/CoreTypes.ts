import { FromSchema, GenericError } from "@zerve/core";
import {
  createZChainState,
  createZChainStateCalculator,
} from "../CoreChain/CoreChain";
import { CoreDataModule } from "../CoreData/CoreData";
import { SystemFilesModule } from "../SystemFiles/SystemFiles";

const CoreTypesStateSchema = {
  type: "object",
  additionalProperties: {
    /* JSON SCHEMA */
  },
} as const;

export type CoreTypesState = FromSchema<typeof CoreTypesStateSchema>;

const defaultTypesState: CoreTypesState = {};

const SetTypeActionSchema = {
  title: "Set or reset a type with a given JSON schema",
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
          ...state,
          [action.name]: action.schema,
        };
      },
    },
  }
);

async function createZTypesStore(
  dataZ: CoreDataModule,
  cacheFiles: SystemFilesModule,
  name = "CoreTypes"
) {
  const Types = await createZChainState(
    dataZ,
    cacheFiles,
    name,
    CoreTypesCalculator
  );
  return Types;
}

export type CoreTypesModule = Awaited<ReturnType<typeof createZTypesStore>>;

const CoreTypes = {
  CoreTypesCalculator,
  createZTypesStore,
};

export default CoreTypes;
