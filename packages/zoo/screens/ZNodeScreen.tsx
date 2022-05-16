import React, { useMemo, useState } from "react";

import { HomeStackScreenProps } from "../app/Links";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import ScreenContainer from "../components/ScreenContainer";
import NotFoundScreen from "./NotFoundScreen";
import { ZFeature } from "../features/ZFeature";

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
