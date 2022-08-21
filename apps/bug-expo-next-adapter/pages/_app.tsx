import Head from "next/head";
import React from "react";
import "raf/polyfill";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Example</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
