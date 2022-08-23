import { useZNode } from "@zerve/client/Query";
import { displayStoreFileName } from "@zerve/core";
import { VStack } from "@zerve/zen";
import { memo, useMemo } from "react";
import {
  StoreFeatureLink,
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function StoreSchemas({ storePath, title }: StoreFeatureProps) {
  const { isLoading, isFetching, data } = useZNode([...storePath, "State"]);
  const entries = useMemo(() => {
    return data && Object.keys(data.node?.$schemas);
  }, [data]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      {entries?.map((schemaName) => {
        return (
          <StoreFeatureLink
            key={schemaName}
            to={{
              key: "schemas",
              schema: schemaName,
            }}
            title={displayStoreFileName(schemaName)}
          />
        );
      })}
      <VStack padded>
        <StoreFeatureLinkButton
          title="Create Schema"
          to={{
            key: "schemas",
            child: "create",
          }}
          icon="plus-circle"
        />
      </VStack>
    </FeaturePane>
  );
}
export const StoreSchemasFeature = memo(StoreSchemas);
