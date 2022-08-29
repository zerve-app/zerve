import { GetStaticProps } from "next";
import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import {
  PageContainer,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  ThemedText,
  ExternalLinkButton,
  Link,
  Icon,
} from "@zerve/zen";

function FooterLink({
  title,
  href,
  external,
}: {
  title: string;
  href: string;
  external?: boolean;
}) {
  return (
    <Link href={href} external={external}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "white", paddingVertical: 8, paddingRight: 8 }}>
          {title}
        </Text>
        {external && <Icon name="external-link" color="white" size={12} />}
      </View>
    </Link>
  );
}

function FooterSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View
      style={{
        minWidth: 310,
        flex: 1,
        marginBottom: 50,
        paddingHorizontal: 18,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function SiteFooter() {
  return (
    <View
      style={{
        backgroundColor: "#323845",
        alignItems: "center",
        paddingVertical: 36,
      }}
    >
      <View
        style={{
          maxWidth: 1000,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <FooterSection title="Docs">
          <FooterLink title="Intro" href="https://docs.zerve.app/docs/intro" />
          <FooterLink
            title="Vision"
            href="https://docs.zerve.app/docs/vision"
          />
          <FooterLink
            title="Developer Workflow"
            href="https://docs.zerve.app/docs/workflow"
          />
        </FooterSection>
        <FooterSection title="Community">
          <FooterLink
            title="YouTube"
            href="https://www.youtube.com/channel/UC2H16-XPP4IWrFl54ADOU3w"
            external
          />
          <FooterLink
            title="Discord"
            href="https://discord.gg/UDBJZRMQTp"
            external
          />
          <FooterLink
            title="Twitter"
            href="https://twitter.com/zerve-app"
            external
          />
        </FooterSection>
        <FooterSection title="More">
          <FooterLink title="Blog" href="https://docs.zerve.app/blog" />
          <FooterLink
            title="GitHub"
            href="https://github.com/zerve-app/zerve"
            external
          />
          <FooterLink title="Service Status" href="https://status.zerve.app" />
        </FooterSection>
      </View>
      <Text style={{ color: "white", fontSize: 16 }}>
        Copyright &copy; {new Date().getFullYear()} Zerve, LLC.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <ExternalLinkButton href="https://docs.zerve.app/docs/intro">
          Docs
        </ExternalLinkButton>
        <ExternalLinkButton href="https://docs.zerve.app/blog">
          Blog
        </ExternalLinkButton>
        <NavBarSpacer />
        <ExternalLinkButton href="https://alpha.zerve.app">
          Alpha App
        </ExternalLinkButton>
      </NavBar>
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          padding: 20,
          justifyContent: "center",
        }}
      >
        <ThemedText>Coming Soon</ThemedText>
      </View>
      <SiteFooter />
    </PageContainer>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
