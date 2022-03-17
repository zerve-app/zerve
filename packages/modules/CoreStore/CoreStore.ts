import {
  createZContainer,
  createZGettableGroup,
  JSONSchema,
} from "@zerve/core";
import CoreChain, { createZChainStateCalculator } from "../CoreChain/CoreChain";
import { CoreDataModule } from "../CoreData/CoreData";
import { CoreTypesModule } from "../CoreTypes/CoreTypes";
import { SystemFilesModule } from "../SystemFiles/SystemFiles";

const AnySchema = {} as const;

// this generi ccalculator is dummbbb replace and rethink idk!!
const GenericCalculator = createZChainStateCalculator(AnySchema, {}, {});

function createGeneralStore<RootSchema extends JSONSchema>(
  data: CoreDataModule,
  types: CoreTypesModule,
  cacheFiles: SystemFilesModule,
  docName: string,
  rootSchema: RootSchema
) {
  // const Write = defineZAction()
  // return createZContainer({
  // });

  const internalStore = CoreChain.createZChainState(
    data,
    cacheFiles,
    docName,
    GenericCalculator
  );

  return createZGettableGroup(
    AnySchema,
    async (childKey: string) => {
      // if .blocks return blocks group
      // if .write return a zAction that validates according to schema and dispatches a write to the chain state
      // else return another gettable group that just filters down
      // grab the schema from "types" then traverse properties[childKey]
      return undefined;
    },
    async () => {
      // getting the current state of the store. grab it from internalStore please.
    }
  );
}

const CoreStore = {
  createGeneralStore,
};
export default CoreStore;
