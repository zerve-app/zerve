import React from "react";
import Dashboard from "@zerve/zoo/web/Dashboard";
import { SavedConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";

export default function DashboardPage(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);
  return (
    <SavedConnectionProvider value={conn}>
      <Dashboard />
    </SavedConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
