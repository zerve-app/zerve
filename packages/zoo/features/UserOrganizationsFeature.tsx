import { useZNodeValue } from "@zerve/client/Query";
import { Button, HStack, Icon, Link, Title } from "@zerve/zen";
import { memo, useContext } from "react";
import {
  UserDashboardContext,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { FeaturePane, NavLinkContent } from "../web/Dashboard";

function NewOrganizationButton() {
  const fragmentContext = useContext(UserDashboardContext);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");

  return (
    <Button
      onPress={() => {
        fragmentContext.navigateFragment({
          key: "organizations",
          child: "create",
        });
      }}
      title="Create Organization"
      left={<Icon name="plus-circle" />}
    />
  );
}

function UserOrganizations({ entityId, title }: UserFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "Auth",
    "user",
    "Orgs",
  ]);
  console.log(data);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      {data?.children.map((name) => (
        <Link key={name} href={`/${entityId}/${name}`}>
          <NavLinkContent title={name} icon="building" />
        </Link>
      ))}
      <HStack>
        <NewOrganizationButton />
      </HStack>
    </FeaturePane>
  );
}
export const UserOrganizationsFeature = memo(UserOrganizations);
