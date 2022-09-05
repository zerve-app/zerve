import React from "react";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import { UserDashboard } from "@zerve/zoo/web/UserDashboard";
import { OrgDashboard } from "@zerve/zoo/web/OrgDashboard";
import {
  getSiteConfig,
  validateUserCanAccessOrg,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { PageProvider } from "@zerve/zoo/provider/PageProvider";
import { GetServerSideProps } from "next";
import { AuthorizedArea } from "@zerve/zoo/app/AuthorizedArea";

type EntityIdProps = WebPathRootServerProps & {
  entityId: string;
  isOrg: boolean;
};

export default function EntityPage(props: EntityIdProps) {
  const conn = useWebConnection(props.config);
  const dashboard = props.isOrg ? (
    <OrgDashboard entityId={props.entityId} />
  ) : (
    <UserDashboard entityId={props.entityId} />
  );
  return (
    <ConnectionProvider value={conn}>
      <PageProvider>
        <AuthorizedArea>{dashboard}</AuthorizedArea>
      </PageProvider>
    </ConnectionProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // getSiteConfig will throw if the session is incorrect.
  const config = await getSiteConfig(context);
  if (!config.session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  // now we trust the requester is config.session.userId
  const entityId = String(context.query.entity);
  if (config.session && config.session.userId === entityId) {
    // requested entity is this user.
    const props: EntityIdProps = {
      config: await getSiteConfig(context),
      entityId,
      isOrg: false,
    };
    return { props };
  }

  if (await validateUserCanAccessOrg(config, entityId)) {
    const props: EntityIdProps = {
      config: await getSiteConfig(context),
      entityId,
      isOrg: true,
    };
    return { props };
  }

  return { redirect: { destination: "/", permanent: false } };
};
