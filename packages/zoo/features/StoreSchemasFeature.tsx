import { useZNode } from "@zerve/zoo-client/Query";
import { displayStoreFileName } from "@zerve/zed";
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
    const schemas = data?.node?.$schemas;
    return (
      schemas &&
      Object.keys(schemas).filter((schemaName) => {
        return !schemas?.[schemaName]?.readOnly;
      })
    );
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
