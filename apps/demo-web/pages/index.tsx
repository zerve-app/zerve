import Head from "next/head";
import { Title } from "@zerve/zen";
import { DemoPageLayout } from "../components/DemoPageLayout";
import { getFromStore } from "../stores/getFromStore";

export default function Web({ banner }) {
  return (
    <DemoPageLayout>
      <Head>
        <title>Demo</title>
      </Head>
      <Title title={banner.value} />
    </DemoPageLayout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      banner: await getFromStore("Home_Banner"),
    },
  };
}
