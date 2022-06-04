import React, { useMemo, useState } from "react";

import { IconButton, useActionsSheet } from "@zerve/zen";
import { useZNode } from "@zerve/client/Query";
import { UnauthorizedSymbol } from "@zerve/client/Connection";
import { FontAwesome } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { ErrorBox, ZNode } from "../components/ZNode";
import {
  useConnectionNavigation,
  useGlobalNavigation,
} from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";

export function ZFeature({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { openRawJSON } = useGlobalNavigation();
  const { closeZ } = useConnectionNavigation();

  const [sheetContent, onOptions] = useActionsSheet(
    (handlePress) => <OptionsButton onOptions={handlePress} />,
    () => [
      {
        key: "refresh",
        title: "Refresh",
        icon: "refresh",
        onPress: refetch,
      },
      {
        key: "rawType",
        title: "Raw Type",
        icon: "code",
        onPress: () => {
          openRawJSON(`${path.join("/")} Type`, data?.type);
        },
      },
      {
        key: "value",
        title: "Raw Value",
        icon: "code",
        onPress: () => {
          openRawJSON(`${path.join("/")} Value`, data?.node);
        },
      },
    ]
  );

  return (
    <>
      {(data?.node === UnauthorizedSymbol ||
        data?.type === UnauthorizedSymbol) && (
        <ErrorBox
          error={
            connection.session
              ? "You are not properly authenticated. Please log out and back in again."
              : "Please log in to view this."
          }
        />
      )}
      <ScreenHeader
        isLoading={isLoading || isRefetching}
        title={path.length ? path.join("/") : "Zerve"}
        onLongPress={onOptions}
        corner={sheetContent}
        onBack={!!path.length ? () => closeZ(path) : undefined}
      ></ScreenHeader>
      <ZNode
        path={path}
        connection={connection}
        type={data?.type}
        value={data?.node}
      />
    </>
  );
}
