import React from "react";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";
import { PageContainer } from "@zerve/zen/Page";
import { Title } from "@zerve/zen/Text";
import { NavBar } from "@zerve/zen/NavBar";

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
