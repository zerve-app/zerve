import Head from "next/head";
import { useRouter } from "next/router";
import { Text } from "react-native";

import Navigator from "../../../../components/Navigator";
import { PageWithPalette } from "../../../../components/Page";
import { useDoc } from "../../../../components/Query";

function singulateString(s: string[] | string) {
  if (Array.isArray(s)) return s[0];
  return s;
}

function DocPage() {
  const { query } = useRouter();
  const { data, isLoading } = useDoc(singulateString(query.docId));
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
        <title>Agent Doc</title>
      </Head>
      <DocPage />
    </PageWithPalette>
  );
}
