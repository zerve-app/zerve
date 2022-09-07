import React from "react";
import { UserDashboard } from "@zerve/zoo/web/UserDashboard";
import { OrgDashboard } from "@zerve/zoo/web/OrgDashboard";
import {
  getSiteConfig,
  validateUserCanAccessOrg,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { GetServerSideProps } from "next";
import { AuthorizedArea } from "@zerve/zoo/app/AuthorizedArea";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";

type EntityIdProps = WebPathRootServerProps & {
  entityId: string;
  isOrg: boolean;
};

export default function EntityPage(props: EntityIdProps) {
  const dashboard = props.isOrg ? (
    <OrgDashboard entityId={props.entityId} />
  ) : (
    <UserDashboard entityId={props.entityId} />
  );
  return (
    <WebPageProvider config={props.config}>
      <AuthorizedArea>{dashboard}</AuthorizedArea>
    </WebPageProvider>
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
