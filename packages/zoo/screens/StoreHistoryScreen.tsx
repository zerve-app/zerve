import React from "react";

import { HomeStackScreenProps } from "../app/Links";
import { useActionsSheet } from "@zerve/zen";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { useZNodeValue } from "@zerve/zoo-client/Query";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { OptionsButton } from "../components/OptionsButton";

function StoreHistoryPage({
  connection,
  storePath,
}: {
  connection: string | null;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([...storePath, "State"]);
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [],
  );
  return (
    <>
      <ScreenHeader
        title={"Chain History"}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
      />
    </>
  );
}

export default function StoreHistoryScreen({
  navigation,
  route,
}: HomeStackScreenProps<"StoreHistory">) {
  const { connection, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreHistoryPage connection={connection} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
