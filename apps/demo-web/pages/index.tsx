import {
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  Title,
} from "@zerve/zen";
import React from "react";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { PageProvider } from "@zerve/zoo/provider/PageProvider";

function HomeScreen() {
  return (
    <PageContainer>
      <NavBar>{null}</NavBar>
      <Title title="Hello, world!" />
    </PageContainer>
  );
}

export default function HomePage(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);

  return (
    <ConnectionProvider value={conn}>
      <PageProvider>
        <HomeScreen />
      </PageProvider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
