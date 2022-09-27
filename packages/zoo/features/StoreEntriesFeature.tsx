import { useZNode } from "@zerve/zoo-client/Query";
import { displayStoreFileName } from "@zerve/zed";
import { memo, useMemo } from "react";
import {
  StoreFeatureLink,
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { NavLinkContentGroup } from "@zerve/zen/NavLink";
import { EmptyContentRow } from "../components/Empty";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { VStack } from "@zerve/zen/Stack";

function StoreEntries({ storePath, title, icon, isActive }: StoreFeatureProps) {
  const { isLoading, isFetching, data } = useZNode([...storePath, "State"]);
  const entries = useMemo(() => {
    const allEntries = data ? Object.keys(data.node as string[]) : undefined;
    return allEntries?.filter((entry) => entry !== "$schemas");
  }, [data]);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      spinner={isLoading || isFetching}
    >
      {entries && entries.length === 0 ? (
        <EmptyContentRow message="No entries in the store yet." />
      ) : null}
      {entries && entries.length ? (
        <NavLinkContentGroup>
          {entries?.map((entryName) => {
            return (
              <StoreFeatureLink
                title={displayStoreFileName(entryName)}
                key={entryName}
                to={{
                  key: "entries",
                  entryName,
                }}
              />
            );
          })}
        </NavLinkContentGroup>
      ) : null}
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
