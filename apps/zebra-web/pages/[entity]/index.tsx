import React from "react";
import { ConnectionProvider } from "@zerve/client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import { UserDashboard } from "@zerve/zoo/web/UserDashboard";
import {
  getSiteConfig,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { Provider } from "@zerve/zoo/provider";
import { GetServerSideProps } from "next";

type EntityIdProps = WebPathRootServerProps & { entityId: string };

export default function EntityPage(props: EntityIdProps) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <Provider>
        <UserDashboard entityId={props.entityId} />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const props: EntityIdProps = {
    config: await getSiteConfig(context),
    entityId: String(context.query.entity),
  };
  if (!props.config.session || props.config.session.userId !== props.entityId) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return {
    props,
  };
};
