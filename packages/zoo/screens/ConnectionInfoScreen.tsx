import {
  AsyncButton,
  Button,
  Icon,
  PageSection,
  Paragraph,
  VStack,
} from "@zerve/zen";
import { SettingsStackScreenProps } from "../app/Links";
import {
  destroyConnection,
  useSavedConnection,
  logout,
} from "../app/ConnectionStorage";
import { InfoRow } from "@zerve/zen/Row";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";

export default function ConnectionInfoScreen({
  navigation,
  route,
}: SettingsStackScreenProps<"ConnectionInfo">) {
  const conn = useSavedConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  const session = conn?.session;
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={`Connection: ${conn?.name}`} />
      <VStack padded>
        <InfoRow label="URL" value={conn?.url} />
      </VStack>
      {session && (
        <PageSection title="Session">
          <VStack padded>
            <InfoRow label="Identity" value={session.userLabel} />
            <AsyncButton
              title="Log Out"
              onPress={async () => {
                await logout(conn, session);
              }}
            />
          </VStack>
        </PageSection>
      )}
      <PageSection title="Delete Connection">
        <VStack padded>
          <Paragraph>
            Delete connection to this server. This is dangerous, but you can
            re-add it later.
          </Paragraph>

          <Button
            onPress={() => {
              destroyConnection(route.params.connection);
              navigation.goBack();
            }}
            danger
            left={(props) => <Icon name="trash" {...props} />}
            title="Delete Server Connection"
          />
        </VStack>
      </PageSection>
    </ScreenContainer>
  );
}
