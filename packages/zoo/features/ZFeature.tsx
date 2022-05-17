import React, { useMemo, useState } from "react";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import { IconButton, useActionsSheet } from "@zerve/zen";
import { UnauthorizedSymbol, useZNode } from "@zerve/query";
import { CompositeNavigationProp } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenHeader from "../components/ScreenHeader";
import { ErrorBox, ZNode } from "../components/ZNode";
import { useNavigation } from "../app/useNavigation";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ZNode">
>;

export function ZFeature({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } = useNavigation<NavigationProp>();

  const [sheetContent, onOptions] = useActionsSheet(
    (handlePress) => (
      <IconButton
        altTitle="Options"
        onPress={handlePress}
        icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
      />
    ),
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
          navigate("RawValue", {
            title: `${path.join("/")} Type`,
            value: data?.type,
          });
        },
      },
      {
        key: "value",
        title: "Raw Value",
        icon: "code",
        onPress: () => {
          navigate("RawValue", {
            title: `${path.join("/")} Value`,
            value: data?.node,
          });
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
            "You are not authorized to view this. Please log out and log back in."
          }
        />
      )}
      <ScreenHeader
        hideBackButton={path.length === 0}
        isLoading={isLoading || isRefetching}
        title={path.length ? path.join("/") : "Z Connection API"}
        onLongPress={onOptions}
        corner={sheetContent}
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
