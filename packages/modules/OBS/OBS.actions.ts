import { defineModuleAction } from "@zerve/core";

export const subtract = defineModuleAction(
  { type: "number" },
  async (myNumberToSubtract: number) => {
    console.log("Subtracting", myNumberToSubtract);
  }
);

const AllActions = {
  subtract,
} as const;
export default AllActions;
