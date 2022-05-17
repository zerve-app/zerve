import React from "react";

import { HomeStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";

export default function StoreSchemasScreen({
  navigation,
  route,
}: HomeStackScreenProps<"StoreSchemas">) {
  const { connection, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreSchemasFeature connection={connection} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
