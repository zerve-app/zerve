import React from "react";

import { HomeStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { NewFileFeature } from "../features/NewFileFeature";

export default function NewFileScreen({
  route,
}: HomeStackScreenProps<"NewFile">) {
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={route.params.connection}>
        <NewFileFeature storePath={route.params.storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
