import {
  useConnection,
  useRequiredConnection,
} from "@zerve/zoo-client/Connection";
import { useZNodeValue } from "@zerve/zoo-client/Query";
import { InfoRow, Title, VStack } from "@zerve/zen";
import { memo, useEffect } from "react";
import { ChangeUsernameButton } from "../components/ZNode";
import { useRouter } from "next/router";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { FeaturePane } from "@zerve/zen/FeaturePane";

function UserSettingsProfile({ title, icon, isActive }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const { data, isLoading, isFetching, refetch } = useZNodeValue([
    "auth",
    "user",
    "profile",
  ]);
  useEffect(() => {
    refetch();
  }, [conn.session]);
  const { replace } = useRouter();
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      spinner={isLoading || isFetching}
    >
      <VStack padded>
        <InfoRow label="Username" value={data?.userId} />
        {conn.session && (
          <ChangeUsernameButton
            connection={conn}
            session={conn.session}
            onUserIdChange={(userId: string) => {
              replace(`/${userId}?_=settings_profile`);
            }}
          />
        )}
        <InfoRow label="Display Name" value={data?.userId} />
      </VStack>
    </FeaturePane>
  );
}
export const UserSettingsProfileFeature = memo(UserSettingsProfile);
