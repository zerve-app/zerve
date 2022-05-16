import React from "react";
import { useRouter } from "next/router";
import { WebPathRoot } from "@zerve/zoo/app/WebPathRoot";

export default function PathScreen() {
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
    />
  );
}
