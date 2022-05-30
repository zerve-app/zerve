import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import React from "react";
import GambitRoot from "../GambitRoot";

export default function HomeScreen(props: WebPathRootServerProps) {
  return <GambitRoot {...props} />;
}

export const getServerSideProps = getWebRootServerProps;
