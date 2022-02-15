import Head from "next/head";
import { Text } from "react-native";

import Navigator from "../../components/Navigator";
import { PageWithPalette } from "../../components/Page";

function IndexDoc() {
  return (
    <>
      <Text>Docs</Text>
      <Text>Blocks</Text>
    </>
  );
}

export default function Web() {
  return (
    <PageWithPalette navigator={<Navigator />}>
      <Head>
        <title>Zerve App</title>
      </Head>
      <IndexDoc />
    </PageWithPalette>
  );
}
