import { ZPathPage } from "@zerve/zoo/components/ZPathPage";
import React from "react";
import { useRouter } from "next/router";

export default function PathScreen() {
  const router = useRouter();
  if (!router.isReady) return null;
  return (
    <ZPathPage
      path={
        Array.isArray(router.query.pathTerms)
          ? router.query.pathTerms
          : [router.query.pathTerms]
      }
    />
  );
}
