import React from "react";
import {
  StoreDashboard,
  StoreDashboardProps,
} from "@zerve/zoo/web/StoreDashboard";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import { WebPathRootServerProps } from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";
import { GetServerSideProps } from "next";
import { SiteConfig } from "@zerve/zoo/app/SiteConfig";

type PageProps = StoreDashboardProps & WebPathRootServerProps;
export default function StorePage(props: PageProps) {
  const { config, ...dashProps } = props;
  const conn = useWebConnection(props.config);
  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <StoreDashboard {...dashProps} />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const origin = process.env.Z_ORIGIN || `http://localhost:3888`;
  const config: SiteConfig = {
    origin,
    session: null,
  };
  const props: PageProps = {
    entityId: null,
    storePath: ["store"],
    storeId: process.env.Z_STORE_TITLE || "Zerve Standalone",
    config,
    href: "/",
    entityIsOrg: false,
  };
  return { props };
};
