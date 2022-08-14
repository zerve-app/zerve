import React from "react";
import { StoreDashboard } from "@zerve/zoo/web/StoreDashboard";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getSiteConfig,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";

export default function StorePage(props) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <StoreDashboard storeId={props.storeId} entityId={props.entityId} />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {
      config: await getSiteConfig(context),
      storeId: context.params.store,
      entityId: context.params.entity,
    },
  };
};
