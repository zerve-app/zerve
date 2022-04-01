import Head from "next/head";
import { useRouter } from "next/router";
import { Text } from "react-native";

import Navigator from "../../../../components/Navigator";
import { PageWithPalette } from "../../../../components/Page";
import { useDoc } from "@zerve/query";

function singulateString(s: string[] | string) {
  if (Array.isArray(s)) return s[0];
  return s;
}

function DocPage() {
  const { query, isReady } = useRouter();
  const docId = singulateString(query.docId);
  const { data, isLoading } = useDoc(docId);

  if (isLoading) return null;
  return (
    <>
      <Text>{JSON.stringify(data)}</Text>
    </>
  );
}

export default function Web() {
  return (
    <PageWithPalette navigator={<Navigator />}>
      <Head>
        <title>Z Doc</title>
      </Head>
      <DocPage />
    </PageWithPalette>
  );
}
