import React from "react";
import { StoreDashboard } from "@zerve/zoo/web/StoreDashboard";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getSiteConfig,
  validateUserCanAccessOrg,
  verifyStoreExists,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";
import { GetServerSideProps } from "next";

type StoreDashboardProps = WebPathRootServerProps & {
  entityId: string;
  entityIsOrg: boolean;
  storeId: string;
};

export default function StorePage(props: StoreDashboardProps) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <StoreDashboard {...props} />
      </Provider>
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
  const props: StoreDashboardProps = {
    entityId,
    storeId,
    config,
    entityIsOrg,
  };
  return { props };
};
