import { HomeStackScreenProps } from "../app/Links";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import NotFoundScreen from "./NotFoundScreen";
import { ZFeature } from "../features/ZFeature";
import ScreenContainer from "@zerve/zen/ScreenContainer";

export default function ZNodeScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ZNode">) {
  const { connection, path } = route.params;
  if (!connection) {
    return <NotFoundScreen />;
  }
  return (
    <ConnectionKeyProvider value={connection}>
      <ScreenContainer scroll>
        <ZFeature path={path} connection={connection} />
      </ScreenContainer>
    </ConnectionKeyProvider>
  );
}
