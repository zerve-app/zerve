import { NavBar, PageContainer, Title } from "@zerve/zen";
import React from "react";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";

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
