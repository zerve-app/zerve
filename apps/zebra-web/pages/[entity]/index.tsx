import React from "react";
import { EntityDashboard } from "@zerve/zoo/web/Dashboard";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";

export default function EntityPage(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <EntityDashboard />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
