import React, { useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  useEffect(() => {
    // there must be a better way to redirect, LOL
    global.window.location = "https://zerve.app";
  }, []);
  return <Layout description=""></Layout>;
}
