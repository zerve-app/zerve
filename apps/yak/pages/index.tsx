import { GetStaticProps } from "next";
import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  PageContainer,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  ThemedText,
  ExternalLinkButton,
  Link,
  Icon,
  LinkButton,
  HStack,
  useColors,
} from "@zerve/zen";
import { LinearGradient } from "expo-linear-gradient";
import Image from "next/image";

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
            title="Get Started"
            href="https://docs.zerve.app/docs/get-started"
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

function NavBarLink({ title, href }) {
  const colors = useColors();
  return (
    <Link href={href}>
      <View
        style={{
          minHeight: 60,
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            alignSelf: "center",
            color: colors.secondaryText,
            fontSize: 18,
            fontWeight: "bold",
            padding: 10,
          }}
        >
          {title}
        </Text>
      </View>
    </Link>
  );
}

function HomeLink({ href, children }: { href: string; children: ReactNode }) {
  const colors = useColors();
  return (
    <Link href={href}>
      <Text
        style={{
          color: colors.tint,
          fontSize: 18,
          fontWeight: "bold",
          padding: 10,
        }}
      >
        {children}
      </Text>
    </Link>
  );
}
export default function HomeScreen() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ minHeight: "100%" }}
    >
      <PageContainer>
        <NavBar>
          <NavBarZLogo />
          <View
            style={{
              paddingHorizontal: 12,
              flexDirection: "row",
              alignSelf: "stretch",
              alignItems: "stretch",
            }}
          >
            <NavBarLink href="https://docs.zerve.app/docs/intro" title="Docs" />
            <NavBarLink href="https://docs.zerve.app/blog" title="Blog" />
          </View>
          <NavBarSpacer />
          <HStack>
            <LinkButton
              href="https://alpha.zerve.app"
              title="Launch App"
              primary
              small
              right={(props) => <Icon name="arrow-right" {...props} />}
            />
          </HStack>
        </NavBar>
        <View
          style={{
            minHeight: 500,
            justifyContent: "center",
            borderTopWidth: 1,
            borderColor: "#eee",
          }}
        >
          <LinearGradient
            colors={["#6144b8", "#9f4ab5"]}
            start={{ x: 0.5, y: 0.0 }}
            style={StyleSheet.absoluteFill}
          />
          <Image
            src={require("../assets/ZContentSystemLight.svg")}
            alt="Zerve Content System – Alpha"
          />
        </View>
        <View
          style={{
            backgroundColor: "white",
            flex: 1,
            padding: 20,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 60,
          }}
        >
          <View style={{ maxWidth: 500 }}>
            <HomeLink href="https://docs.zerve.app">📚 Get Started</HomeLink>
            <HomeLink href="https://twitter.com/ZerveApp">
              🐤 Follow Zerve on Twitter
            </HomeLink>
            <HomeLink href="https://discord.gg/UDBJZRMQTp">
              💬 Join our Discord
            </HomeLink>
            <HomeLink href="https://www.youtube.com/channel/UC2H16-XPP4IWrFl54ADOU3w">
              🎥 Watch along on YouTube
            </HomeLink>
            <HomeLink href="https://github.com/zerve-app/zerve">
              ⭐️ Star this repo 😎
            </HomeLink>
          </View>
        </View>
        <SiteFooter />
      </PageContainer>
    </ScrollView>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
