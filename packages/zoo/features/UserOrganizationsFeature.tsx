import { useZNodeValue } from "@zerve/zoo-client/Query";
import { Button, HStack, Icon, Link, Title } from "@zerve/zen";
import { memo, useContext } from "react";
import {
  UserDashboardContext,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { FeaturePane } from "../components/FeaturePane";
import { NavLinkContent, NavLinkContentGroup } from "@zerve/zen/NavLink";

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
    "auth",
    "user",
    "orgs",
  ]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      <NavLinkContentGroup>
        {data?.children.map((orgId) => (
          <Link key={orgId} href={`/${orgId}`}>
            <NavLinkContent title={orgId} icon="building" />
          </Link>
        ))}
      </NavLinkContentGroup>
      <HStack padded>
        <NewOrganizationButton />
      </HStack>
    </FeaturePane>
  );
}
export const UserOrganizationsFeature = memo(UserOrganizations);
