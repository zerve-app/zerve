import { WebPathRoot } from "@zerve/zoo/app/WebPathRoot";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import React from "react";

export default function HomeScreen(props: WebPathRootServerProps) {
  return <WebPathRoot path={[]} {...props} />;
}

export const getServerSideProps = getWebRootServerProps;
