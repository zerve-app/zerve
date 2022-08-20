import {
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  Title,
} from "@zerve/zen";
import React from "react";
import { AuthHeader } from "@zerve/zoo/components/AuthHeader";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { ConnectionProvider } from "@zerve/client/Connection";
import { Provider } from "@zerve/zoo/provider";

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
      <Provider>
        <HomeScreen />
      </Provider>
    </ConnectionProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
