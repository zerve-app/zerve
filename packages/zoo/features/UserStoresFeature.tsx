import { useZNodeValue } from "@zerve/zoo-client/Query";
import { memo, useContext } from "react";
import {
  UserDashboardContext,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { NavLinkContent, NavLinkContentGroup } from "@zerve/zen/NavLink";
import { EmptyContentRow } from "../components/Empty";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { Button } from "@zerve/zen/Button";
import { Icon } from "@zerve/zen/Icon";
import { HStack } from "@zerve/zen/Stack";
import { Link } from "@zerve/zen/Link";

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

function UserStores({ entityId, title, icon, isActive }: UserFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "auth",
    "user",
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
        <EmptyContentRow message="No stores here yet." />
      ) : null}
      {data?.children?.length ? (
        <NavLinkContentGroup>
          {data?.children?.map((storeName) => (
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

export const UserStoresFeature = memo(UserStores);
