import { ConnectionProvider, useZNode } from "@zerve/query";
import { Paragraph, Spinner, Title } from "@zerve/zen";
import Head from "next/head";
import { ZLoadedNode } from "./ZNode";
import { PageLayout } from "./PageLayout";

export function ZPath({ path }: { path: string[] }) {
  return (
    <>
      <Head>
        <title>{path.at(-1) || "Z"}</title>
      </Head>
      <Title title={path.length ? path.join("/") : "z"} />
      {/* <ZLoadedNode path={path} /> */}
    </>
  );
}

export function ZPathPage({ path }: { path: string[] }) {
  return (
    <PageLayout>
      <ZPath path={path} />
    </PageLayout>
  );
}
