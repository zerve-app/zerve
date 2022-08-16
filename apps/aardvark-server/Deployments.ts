import { createZContainer, createZGettableGroup } from "@zerve/core";

export const Deployments = createZGettableGroup(
  async (deploymentId: string) => {
    return createZContainer({} as const);
  },
  async () => {
    return {
      children: [],
      more: false,
      cursor: "",
    };
  }
);
