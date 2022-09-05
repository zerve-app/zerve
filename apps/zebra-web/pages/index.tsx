import {
  ExternalLinkButton,
  Icon,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  useColors,
} from "@zerve/zen";
import React from "react";
import { AuthHeader } from "@zerve/zoo/components/AuthHeader";
import { useWebConnection } from "@zerve/zoo/app/ConnectionStorage";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { PageProvider } from "@zerve/zoo/provider/PageProvider";
import Image from "next/image";
import { Text, View } from "react-native";

function HomeScreen() {
  const colors = useColors();
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <NavBarSpacer />
        <AuthHeader />
      </NavBar>
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          padding: 20,
          justifyContent: "center",
          borderTopWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              color: colors.tint,
              fontSize: 38,
              marginHorizontal: 14,
              fontWeight: "bold",
            }}
          >
            Get Started Here
          </Text>
          <Icon name="arrow-up" size={32} color={colors.tint} />
        </View>
        <Image src={require("../assets/ContentSystemBanner.svg")} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <ExternalLinkButton href="https://zerve.app">
            Public Home
          </ExternalLinkButton>
          <ExternalLinkButton href="https://docs.zerve.app/docs/intro">
            Documentation
          </ExternalLinkButton>
        </View>
      </View>
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
