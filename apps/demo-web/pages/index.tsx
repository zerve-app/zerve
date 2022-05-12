import Head from "next/head";
import { Title } from "@zerve/zen";
import { PageLayout } from "../components/PageLayout";
import { getFromStore } from "../stores/getFromStore";

export default function Web({ banner }) {
  return (
    <PageLayout>
      <Head>
        <title>Demo</title>
      </Head>
      <Title title={banner.value} />
    </PageLayout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      banner: await getFromStore("Home_Banner"),
    },
  };
}
