import { useZNodeValue } from "@zerve/client/Query";
import { InfoRow, Title, VStack } from "@zerve/zen";
import { memo } from "react";
import { FeaturePane } from "../web/Dashboard";

function UserSettingsProfile({
  entityId,
  title,
}: {
  entityId: string;
  title: string;
}) {
  const { data, isLoading, isFetching } = useZNodeValue([
    "Auth",
    "user",
    "profile",
  ]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      <VStack padded>
        <InfoRow label="Username" value={data?.userId} />
        <InfoRow label="Display Name" value={data?.userId} />
      </VStack>
    </FeaturePane>
  );
}
export const UserSettingsProfileFeature = memo(UserSettingsProfile);
