import { useZNodeValue } from "@zerve/zoo-client/Query";
import { memo, useContext } from "react";
import {
  OrgDashboardContext,
  OrgFeatureProps,
} from "../context/OrgDashboardContext";
import { NavLinkContent, NavLinkContentGroup } from "@zerve/zen/NavLink";
import { EmptyContentRow } from "../components/Empty";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { Link } from "@zerve/zen/Link";
import { HStack } from "@zerve/zen/Stack";
import { Icon } from "@zerve/zen/Icon";
import { Button } from "@zerve/zen/Button";

function NewStoreButton() {
  const fragmentContext = useContext(OrgDashboardContext);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");

  return (
    <Button
      onPress={() => {
        fragmentContext.navigateFragment({ key: "stores", child: "create" });
      }}
      title="Create Store"
      left={<Icon name="plus-circle" />}
    />
  );
}

function OrgStores({ entityId, title, icon, isActive }: OrgFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "auth",
    "user",
    "orgs",
    entityId,
    "stores",
  ]);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      spinner={isLoading || isFetching}
    >
      {data?.children && data?.children.length === 0 ? (
        <EmptyContentRow message="No stores in the org yet." />
      ) : null}
      {data?.children && data?.children.length ? (
        <NavLinkContentGroup>
          {data?.children.map((storeName) => (
            <Link key={storeName} href={`/${entityId}/${storeName}`}>
              <NavLinkContent title={storeName} icon="briefcase" />
            </Link>
          ))}
        </NavLinkContentGroup>
      ) : null}
      <HStack padded>
        <NewStoreButton />
      </HStack>
    </FeaturePane>
  );
}

export const OrgStoresFeature = memo(OrgStores);
