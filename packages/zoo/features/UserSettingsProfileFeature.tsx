import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { useZNodeValue } from "@zerve/client/Query";
import { InfoRow, Title, VStack } from "@zerve/zen";
import { memo, useEffect } from "react";
import { ChangeUsernameButton } from "../components/ZNode";
import { FeaturePane } from "../web/Dashboard";
import { useRouter } from "next/router";

function UserSettingsProfile({
  entityId,
  title,
}: {
  entityId: string;
  title: string;
}) {
  const conn = useRequiredConnection();
  const { data, isLoading, isFetching, refetch } = useZNodeValue([
    "Auth",
    "user",
    "profile",
  ]);
  useEffect(() => {
    refetch();
  }, [conn.session]);
  const { replace } = useRouter();
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
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
