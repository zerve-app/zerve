import { NavBarSpacer, PageContainer } from "@zerve/zen";
import React, { createContext } from "react";
import { AuthHeader } from "@zerve/zoo/components/AuthHeader";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { DashboardPage } from "@zerve/zoo/web/Dashboard";
import { FragmentContext } from "@zerve/zoo/web/Fragment";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";
import { PlaygroundFeatures } from "@zerve/zen-playground/PlaygroundFeatures";

type PlaygroundState = "home" | "toast" | "button" | "spinner";

export const PlaygroundContext =
  createContext<null | FragmentContext<PlaygroundState>>(null);

const PlaygroundFeatureNames = Object.values(PlaygroundFeatures).map(
  (c) => c.name,
);

function PlaygroundScreen() {
  return (
    <PageContainer>
      <DashboardPage<PlaygroundState>
        Context={PlaygroundContext}
        defaultFeature={PlaygroundFeatureNames[0]}
        header={
          <>
            <NavBarSpacer />
            <AuthHeader />
          </>
        }
        renderFeature={({ feature }) => {
          const playground = Object.values(PlaygroundFeatures).find(
            (c) => c.name === feature,
          );
          const Component = playground?.Feature;
          if (Component) return <Component />;
          return null;
        }}
        navigation={PlaygroundFeatureNames}
        getFeatureTitle={(feature) => {
          const Component = Object.values(PlaygroundFeatures).find(
            (c) => c.name === feature,
          );
          return Component?.title || "Playground";
        }}
        getFeatureIcon={(feature) => {
          const Component = Object.values(PlaygroundFeatures).find(
            (c) => c.name === feature,
          );
          return Component?.icon || "leaf";
        }}
        parseFeatureFragment={(f) => f}
        stringifyFeatureFragment={(f) => f}
      />
    </PageContainer>
  );
}

export default function AdminPage(props: WebPathRootServerProps) {
  return (
    <WebPageProvider config={props.config}>
      <PlaygroundScreen />
    </WebPageProvider>
  );
}

export const getServerSideProps = getWebRootServerProps;
