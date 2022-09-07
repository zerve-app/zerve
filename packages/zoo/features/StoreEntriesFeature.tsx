import { useZNode } from "@zerve/zoo-client/Query";
import { displayStoreFileName } from "@zerve/zed";
import { VStack } from "@zerve/zen";
import { memo, useMemo } from "react";
import {
  StoreFeatureLink,
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { FeaturePane } from "../components/FeaturePane";

function StoreEntries({ storePath, title }: StoreFeatureProps) {
  const { isLoading, isFetching, data } = useZNode([...storePath, "State"]);
  const entries = useMemo(() => {
    const allEntries = data ? Object.keys(data.node as string[]) : [];
    return allEntries.filter((entry) => entry !== "$schemas");
  }, [data]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      {entries.map((entryName) => {
        return (
          <StoreFeatureLink
            title={displayStoreFileName(entryName)}
            key={entryName}
            to={{
              key: "entries",
              path: [entryName],
            }}
          />
        );
      })}
      <VStack padded>
        <StoreFeatureLinkButton
          title="Create Entry"
          to={{
            key: "entries",
            child: "create",
          }}
          icon="plus-circle"
        />
      </VStack>
    </FeaturePane>
  );
}
export const StoreEntriesFeature = memo(StoreEntries);
