import Head from "next/head";
import { Title } from "@zerve/ui";
import { PageLayout } from "../components/PageLayout";

export default function Web() {
  return (
    <PageLayout>
      <Head>
        <title>Demo</title>
      </Head>
      <Title title={"Launching April 2022"} />
    </PageLayout>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
