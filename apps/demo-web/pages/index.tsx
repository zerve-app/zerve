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
import { WebPageProvider } from "@zerve/zoo/provider/WebPageProvider";

function HomeScreen() {
  return (
    <PageContainer>
      <NavBar>{null}</NavBar>
      <Title title="Hello, world!" />
    </PageContainer>
  );
}

export default function HomePage(props: WebPathRootServerProps) {
  return (
    <WebPageProvider config={props.config}>
      <HomeScreen />
    </WebPageProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
