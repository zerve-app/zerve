import React from "react";
import {
  StoreDashboard,
  StoreDashboardProps,
} from "@zerve/zoo/web/StoreDashboard";
import { WebPathRootServerProps } from "@zerve/zoo/web/ZooWebServer";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";
import { GetServerSideProps } from "next";
import { SiteConfig } from "@zerve/zoo/app/SiteConfig";

type PageProps = StoreDashboardProps & WebPathRootServerProps;
export default function StorePage(props: PageProps) {
  const { config, ...dashProps } = props;
  return (
    <WebPageProvider config={props.config}>
      <StoreDashboard {...dashProps} />
    </WebPageProvider>
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
