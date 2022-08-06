import React from "react";
import Dashboard from "@zerve/zoo/web/Dashboard";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";

export default function DashboardPage(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);
  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <Dashboard />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
