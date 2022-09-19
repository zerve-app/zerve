import { useZNodeValue } from "@zerve/zoo-client/Query";
import { Button, HStack, Icon, Link } from "@zerve/zen";
import { memo, useContext } from "react";
import {
  OrgDashboardContext,
  OrgFeatureProps,
} from "../context/OrgDashboardContext";
import { FeaturePane } from "../components/FeaturePane";
import { NavLinkContent, NavLinkContentGroup } from "@zerve/zen/NavLink";

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
      <NavLinkContentGroup>
        {data?.children.map((storeName) => (
          <Link key={storeName} href={`/${entityId}/${storeName}`}>
            <NavLinkContent title={storeName} icon="briefcase" />
          </Link>
        ))}
      </NavLinkContentGroup>
      <HStack padded>
        <NewStoreButton />
      </HStack>
    </FeaturePane>
  );
}

export const OrgStoresFeature = memo(OrgStores);
