import React from "react";

import { Spinner, ActionButtonDef } from "@zerve/zen";
import { useConnection, useZNode } from "@zerve/query";
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
