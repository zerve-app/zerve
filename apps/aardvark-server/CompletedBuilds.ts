import {
  createZContainer,
  createZGettable,
  createZAction,
  createZGettableGroup,
  createZStatic,
  NullSchema,
} from "@zerve/core";
import { Command } from "@zerve/system-commands";
import { ReadDir, ReadJSON } from "@zerve/system-files";
import { DeployZebraStaging } from "./DeployZebraStaging";

function getBuildDetailsZ(buildId: string) {
  return createZGettable({} as const, async () => {
    const details = await ReadJSON.call(
      `/root/zebra-build-details/${buildId}.json`
    );
    return details;
  });
}

function getBuildDestroyZ(buildId: string) {
  return createZAction(NullSchema, NullSchema, async () => {
    await Command.call({
      command: "rm",
      args: ["-rf", `/root/zebra-builds/${buildId}.tar.gz`],
    });
    return null;
  });
}

export const CompletedBuilds = createZGettableGroup(
  async (buildId: string) => {
    return createZContainer({
      BuildId: createZStatic(buildId),
      DeployStaging: DeployZebraStaging(buildId),
      Details: getBuildDetailsZ(buildId),
      Destroy: getBuildDestroyZ(buildId),
    } as const);
  },
  async () => {
    const tarballList = await ReadDir.call("/root/zebra-builds");
    return {
      children: tarballList.map((tarballName: string) =>
        tarballName.slice(0, -7)
      ), // strip .tar.gz
      cursor: "",
      more: false,
    };
  }
);
