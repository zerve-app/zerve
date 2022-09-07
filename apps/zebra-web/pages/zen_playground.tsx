import {
  Button,
  Link,
  NavBarSpacer,
  PageContainer,
  PageSection,
  Paragraph,
  showErrorToast,
  showToast,
  Spinner,
  useColors,
  VStack,
} from "@zerve/zen";
import React, { createContext } from "react";
import { AuthHeader } from "@zerve/zoo/components/AuthHeader";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import { DashboardPage, FeaturePane } from "@zerve/zoo/web/Dashboard";
import { FragmentContext } from "@zerve/zoo/web/Fragment";
import { WebPageProvider } from "@zerve/zoo/web/WebPageProvider";

type PlaygroundState = "home" | "toast" | "button" | "spinner";

export const PlaygroundContext =
  createContext<null | FragmentContext<PlaygroundState>>(null);

function PlaygroundHome() {
  return (
    <FeaturePane title="Zen UI Playground">
      <Paragraph>
        A playground to see the{" "}
        <Link inline href="https://docs.zerve.app/docs/internal/zen">
          Zen UI
        </Link>{" "}
        in action!
      </Paragraph>
      <Paragraph>
        Browse the{" "}
        <Link
          inline
          href="https://github.com/zerve-app/zerve/blob/main/packages/zen/"
        >
          code on GitHub
        </Link>{" "}
        to see the full suite of components that power Zerve.
      </Paragraph>
      <Paragraph>
        This is (clearly) a work in progress. The main priority is the Zerve
        Content System!
      </Paragraph>
    </FeaturePane>
  );
}

function ToastPlayground() {
  return (
    <FeaturePane title="Toast">
      <PageSection title="Open Toasts">
        <VStack padded>
          <Button
            title="Toast"
            onPress={() => {
              showToast("Toast Example");
            }}
          />
          <Button
            title="Error Toast"
            onPress={() => {
              showErrorToast("Error Toast Example");
            }}
          />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}

function ButtonPlayground() {
  return (
    <FeaturePane title="Button">
      <PageSection title="Variants">
        <VStack padded>
          <Button title="Normal" onPress={() => {}} />
          <Button title="Danger" danger onPress={() => {}} />
          <Button title="Primary" primary onPress={() => {}} />
          <Button title="Chromeless" chromeless onPress={() => {}} />
        </VStack>
        <PageSection title="Sizes"></PageSection>
        <VStack padded>
          <Button title="Normal" onPress={() => {}} />
          <Button title="Small" small onPress={() => {}} />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
function SpinnerPlayground() {
  return (
    <FeaturePane title="Spinner">
      <PageSection title="Large">
        <Spinner size="large" />
      </PageSection>
      <PageSection title="Small">
        <Spinner size="small" />
      </PageSection>
    </FeaturePane>
  );
}

function PlaygroundScreen() {
  const colors = useColors();
  return (
    <PageContainer>
      <DashboardPage<PlaygroundState>
        Context={PlaygroundContext}
        defaultFeature="home"
        header={
          <>
            <NavBarSpacer />
            <AuthHeader />
          </>
        }
        renderFeature={({ feature }) => {
          if (feature === "home") return <PlaygroundHome />;
          if (feature === "toast") return <ToastPlayground />;
          if (feature === "button") return <ButtonPlayground />;
          if (feature === "spinner") return <SpinnerPlayground />;
          return null;
        }}
        navigation={["home", "toast", "button", "spinner"]}
        getFeatureTitle={(f) => f}
        getFeatureIcon={() => "leaf"}
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
