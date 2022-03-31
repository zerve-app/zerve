import Head from "next/head";
import { Title } from "@zerve/ui";
import { getFromStore } from "../stores/getFromStore";
import { PageLayout } from "../components/PageLayout";

export default function Web({ info }) {
  return (
    <PageLayout>
      <Head>
        <title>Demo</title>
      </Head>
      <Title title={info.value} />
    </PageLayout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      info: await getFromStore("Homepage_Banner"),
    },
  };
}
