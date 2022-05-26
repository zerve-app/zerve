import { HomeStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreSchemaFeature } from "../features/StoreSchemaFeature";

export default function StoreSchemaScreen({
  route,
}: HomeStackScreenProps<"StoreSchema">) {
  const { connection, schema, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreSchemaFeature schema={schema} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
