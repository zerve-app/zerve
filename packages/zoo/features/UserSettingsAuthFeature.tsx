import { useRequiredConnection } from "@zerve/client/Connection";
import { useZNodeValue } from "@zerve/client/Query";
import { InfoRow, Title, VStack } from "@zerve/zen";
import { memo } from "react";
import { ChangePasswordButton } from "../components/ZNode";
import { FeaturePane } from "../web/Dashboard";

function UserSettingsAuth({
  entityId,
  title,
}: {
  entityId: string;
  title: string;
}) {
  const conn = useRequiredConnection();
  const { data, isLoading, isFetching } = useZNodeValue([
    "Auth",
    "user",
    "profile",
  ]);
  return (
    <FeaturePane title={title} spinner={isLoading || isFetching}>
      <VStack padded>
        {data?.addresses?.map((address) => (
          <InfoRow
            key={address.strategyName}
            label={address.strategyName}
            value={address.address}
          />
        ))}
        <InfoRow
          label="Password"
          value={data?.hasPassword ? "****" : "Not Set"}
        />
        {conn.session && (
          <ChangePasswordButton connection={conn} session={conn.session} />
        )}
      </VStack>
    </FeaturePane>
  );
}
export const UserSettingsAuthFeature = memo(UserSettingsAuth);
