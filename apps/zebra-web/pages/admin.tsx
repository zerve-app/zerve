import {
  ExternalLinkButton,
  Icon,
  Link,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  ToastPresenter,
  useColors,
} from "@zerve/zen";
import React, { ReactNode } from "react";
import { AuthHeader } from "@zerve/zoo/components/AuthHeader";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { PageProvider } from "@zerve/zoo/provider/PageProvider";
import { TestUIFeature } from "@zerve/zoo/screens/TestUIScreen";

function AdminScreen() {
  const colors = useColors();
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <NavBarSpacer />
        <AuthHeader />
      </NavBar>
      <TestUIFeature />
    </PageContainer>
  );
}

export default function AdminPage(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <PageProvider>
        <AdminScreen />
      </PageProvider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
