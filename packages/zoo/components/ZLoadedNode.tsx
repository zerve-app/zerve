import React from "react";

import { Spinner, ActionButtonDef } from "@zerve/zen";
import { UnauthorizedSymbol, useConnection, useZNode } from "@zerve/query";
import { ErrorBox, ZNode } from "./ZNode";

export function ZLoadedNode({
  path,
  onActions,
}: {
  path: string[];
  onActions?: (actions: ActionButtonDef[]) => void;
}) {
  const conn = useConnection();
  const { isLoading, data, refetch, error, isError, isRefetching } =
    useZNode(path);

  React.useEffect(() => {
    onActions?.([
      {
        title: "Refresh",
        key: "refresh",
        icon: "refresh",
        onPress: () => {
          refetch();
        },
      },
    ]);
  }, [refetch]);
  if (!conn) return null;

  return (
    <>
      {isLoading && <Spinner />}
      {(data?.node === UnauthorizedSymbol ||
        data?.type === UnauthorizedSymbol) && (
        <ErrorBox
          error={
            "You are not authorized to view this. Please log out and log back in."
          }
        />
      )}
      {isError && <ErrorBox error={error} />}
      <ZNode
        path={path}
        connection={conn.key}
        type={data?.type}
        value={data?.node}
      />
    </>
  );
}
