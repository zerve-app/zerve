import { ConnectionProvider, useZNode } from "@zerve/query";
import { Paragraph, Spinner, Title } from "@zerve/ui";
import Head from "next/head";
import { PageLayout } from "./PageLayout";

export function ZPath({ path }: { path: string[] }) {
  const { data, isLoading } = useZNode(path);
  return (
    <>
      <Head>
        <title>{path.at(-1) || "Z"}</title>
      </Head>
      <Title title="Helol" />
      {isLoading && <Spinner />}
      <Paragraph>{JSON.stringify(data)}</Paragraph>
    </>
  );
}

export default function ZPathPage({ path }: { path: string[] }) {
  return (
    <PageLayout>
      <ZPath path={path} />
    </PageLayout>
  );
}
