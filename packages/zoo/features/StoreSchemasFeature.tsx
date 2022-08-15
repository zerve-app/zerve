import { useZNode } from "@zerve/client/Query";
import { Button, Icon, Title, VStack } from "@zerve/zen";
import { memo, useContext, useMemo } from "react";
import {
  StoreDashboardContext,
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function NewSchemaButton() {
  const fragmentContext = useContext(StoreDashboardContext);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");

  return (
    <Button
      onPress={() => {
        fragmentContext.navigateFragment({
          key: "schemas",
          child: "create",
        });
      }}
      title="Create Schema"
      left={<Icon name="plus-circle" />}
    />
  );
}

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
            title={schemaName}
          />
        );
      })}
      <VStack padded>
        <NewSchemaButton />
      </VStack>
    </FeaturePane>
  );
}
export const StoreSchemasFeature = memo(StoreSchemas);
