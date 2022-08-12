import React from "react";
import { EntityDashboard } from "@zerve/zoo/web/Dashboard";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getSiteConfig,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";
import { GetServerSideProps } from "next";

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      config: await getSiteConfig(context),
    },
  };
};
