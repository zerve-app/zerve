import { useZNode } from "@zerve/client/Query";
import { Button, Icon, Title, VStack } from "@zerve/zen";
import { memo, useContext, useMemo } from "react";
import {
  StoreDashboardContext,
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function NewStoreButton() {
  const fragmentContext = useContext(StoreDashboardContext);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");

  return (
    <Button
      onPress={() => {
        fragmentContext.navigateFragment({
          key: "entries",
          path: [],
          child: "create",
        });
      }}
      title="Create Entry"
      left={<Icon name="plus-circle" />}
    />
  );
}

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
            title={entryName}
            key={entryName}
            to={{
              key: "entries",
              path: [entryName],
            }}
          />
        );
      })}
      <VStack padded>
        <NewStoreButton />
      </VStack>
    </FeaturePane>
  );
}
export const StoreEntriesFeature = memo(StoreEntries);
