import { Provider } from "@zerve/zoo/provider";
import Head from "next/head";
import React from "react";
import "raf/polyfill";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Zerve</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="manifest"
          crossOrigin="use-credentials"
          href="/site.webmanifest"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8427b2" />
        <meta name="msapplication-TileColor" content="#8c42b4" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default MyApp;
