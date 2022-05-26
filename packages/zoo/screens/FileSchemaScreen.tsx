import { HomeStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreFileSchemaFeature } from "../features/StoreFileSchemaFeature";

export default function FileSchemaScreen({
  route,
}: HomeStackScreenProps<"FileSchema">) {
  const { connection, name, storePath } = route.params;
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreFileSchemaFeature name={name} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
