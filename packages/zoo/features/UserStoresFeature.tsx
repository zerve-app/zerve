import { useZNodeValue } from "@zerve/zoo-client/Query";
import { Button, HStack, Icon, Link, Title } from "@zerve/zen";
import { memo, useContext } from "react";
import {
  UserDashboardContext,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { NavLinkContent } from "../web/Dashboard";
import { FeaturePane } from "../components/FeaturePane";

function NewStoreButton() {
  const fragmentContext = useContext(UserDashboardContext);
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

function UserStores({ entityId, title }: UserFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "auth",
    "user",
    "stores",
  ]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      {data?.children?.map((storeName) => (
        <Link key={storeName} href={`/${entityId}/${storeName}`}>
          <NavLinkContent title={storeName} icon="briefcase" />
        </Link>
      ))}
      <HStack padded>
        <NewStoreButton />
      </HStack>
    </FeaturePane>
  );
}

export const UserStoresFeature = memo(UserStores);
