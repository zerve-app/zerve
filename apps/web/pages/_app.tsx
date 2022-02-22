import Head from "next/head";
import * as React from "react";
import { QueryProvider } from "@zerve/query";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <QueryProvider>
        <Component {...pageProps} />
      </QueryProvider>
    </>
  );
}

export default MyApp;
