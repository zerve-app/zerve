import React from "react";
import {
  StoreDashboard,
  StoreDashboardProps,
} from "@zerve/zoo/web/StoreDashboard";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getSiteConfig,
  validateUserCanAccessOrg,
  verifyStoreExists,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { GetServerSideProps } from "next";
import { AuthorizedArea } from "@zerve/zoo/app/AuthorizedArea";

type PageProps = WebPathRootServerProps & StoreDashboardProps;

export default function StorePage(props: PageProps) {
  const { config, ...dashProps } = props;
  const conn = useWebConnection(props.config);
  return (
    <ConnectionProvider value={conn}>
      <AuthorizedArea>
        <StoreDashboard {...dashProps} />
      </AuthorizedArea>
    </ConnectionProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const entityId = String(context.query.entity);
  const storeId = String(context.query.store);
  const config = await getSiteConfig(context);
  if (!config.session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  let entityIsOrg = config.session.userId !== entityId;
  if (entityIsOrg && !(await validateUserCanAccessOrg(config, entityId))) {
    return {
      redirect: { destination: `/${config.session.userId}`, permanent: false },
    };
  }
  if (!(await verifyStoreExists(config, entityId, storeId, entityIsOrg))) {
    return {
      redirect: { destination: `/${entityId}`, permanent: false },
    };
  }
  const props: PageProps = {
    entityId,
    storeId,
    config,
    entityIsOrg,
    storePath: entityIsOrg
      ? ["auth", "user", "Orgs", entityId, "Stores", storeId]
      : ["auth", "user", "Stores", storeId],
    href: `/${entityId}/${storeId}`,
  };
  return { props };
};
