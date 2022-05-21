import React from "react";
import { useRouter } from "next/router";
import { WebPathRoot } from "@zerve/zoo/app/WebPathRoot";
import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";

export default function PathScreen(props: WebPathRootServerProps) {
  const router = useRouter();
  if (!router.isReady) return null;
  return (
    <WebPathRoot
      path={
        Array.isArray(router.query.pathTerms)
          ? router.query.pathTerms
          : router.query.pathTerms
          ? [router.query.pathTerms]
          : []
      }
      {...props}
    />
  );
}

export const getServerSideProps = getWebRootServerProps;
