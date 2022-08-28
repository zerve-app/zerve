import { useZNodeValue } from "@zerve/zoo-client/Query";
import { Button, HStack, Icon, Link } from "@zerve/zen";
import { memo, useContext } from "react";
import {
  OrgDashboardContext,
  OrgFeatureProps,
} from "../context/OrgDashboardContext";
import { FeaturePane, NavLinkContent } from "../web/Dashboard";

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

function OrgStores({ entityId, title }: OrgFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "Auth",
    "user",
    "Orgs",
    entityId,
    "Stores",
  ]);
  console.log("OrgStores", data);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      {data?.children.map((storeName) => (
        <Link key={storeName} href={`/${entityId}/${storeName}`}>
          <NavLinkContent title={storeName} icon="briefcase" />
        </Link>
      ))}
      <HStack>
        <NewStoreButton />
      </HStack>
    </FeaturePane>
  );
}

export const OrgStoresFeature = memo(OrgStores);
