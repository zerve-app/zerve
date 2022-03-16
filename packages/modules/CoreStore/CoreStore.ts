import { createZContainer } from "@zerve/core";
import { CoreDataModule } from "../CoreData/CoreData";
import { CoreTypesModule } from "../CoreTypes/CoreTypes";

function createGeneralStore(
  data: CoreDataModule,
  types: CoreTypesModule,
  docName: string
) {
  return createZContainer({});
}

const CoreStore = {
  createGeneralStore,
};
export default CoreStore;
