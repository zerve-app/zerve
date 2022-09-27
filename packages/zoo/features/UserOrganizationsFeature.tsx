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
import { HStack } from "@zerve/zen/Stack";
import { Link } from "@zerve/zen/Link";
import { Icon } from "@zerve/zen/Icon";

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

function UserOrganizations({
  entityId,
  title,
  icon,
  isActive,
}: UserFeatureProps) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "auth",
    "user",
    "orgs",
  ]);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      spinner={isLoading || isFetching}
    >
      {data?.children && data?.children.length === 0 ? (
        <EmptyContentRow message="You are not in any organizations yet." />
      ) : null}
      {data?.children && data?.children.length ? (
        <NavLinkContentGroup>
          {data?.children.map((orgId) => (
            <Link key={orgId} href={`/${orgId}`}>
              <NavLinkContent title={orgId} icon="building" />
            </Link>
          ))}
        </NavLinkContentGroup>
      ) : null}
      <HStack padded>
        <NewOrganizationButton />
      </HStack>
    </FeaturePane>
  );
}
export const UserOrganizationsFeature = memo(UserOrganizations);
