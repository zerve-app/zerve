import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { useZNodeValue } from "@zerve/zoo-client/Query";
import { InfoRow, Title, VStack } from "@zerve/zen";
import { memo } from "react";
import { ChangePasswordButton } from "../components/ZNode";
import { FeaturePane } from "../components/FeaturePane";
import { UserFeatureProps } from "../context/UserDashboardContext";

function UserSettingsAuth({ title }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const { data, isLoading, isFetching } = useZNodeValue([
    "auth",
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
