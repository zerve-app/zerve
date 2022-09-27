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

function StoreSchemas({
  storePath,
  title,
  icon,
  isActive,
  onBack,
}: StoreFeatureProps) {
  const { isLoading, isFetching, data } = useZNode([...storePath, "State"]);
  const schemas = useMemo(() => {
    const schemas = data?.node?.$schemas;
    return (
      schemas &&
      Object.keys(schemas).filter((schemaName) => {
        return !schemas?.[schemaName]?.readOnly;
      })
    );
  }, [data]);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      onBack={onBack}
      spinner={isLoading || isFetching}
    >
      {schemas && schemas.length === 0 ? (
        <EmptyContentRow message="No store schemas yet." />
      ) : null}
      {schemas && schemas.length ? (
        <NavLinkContentGroup>
          {schemas?.map((schemaName) => {
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
        </NavLinkContentGroup>
      ) : null}
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
