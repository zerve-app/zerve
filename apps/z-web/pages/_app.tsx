import Head from "next/head";
import * as React from "react";
import { QueryProvider } from "@zerve/query";

if (!global.requestAnimationFrame) {
  // @ts-ignore
  global.requestAnimationFrame = (cb) => {
    setTimeout(cb, 1);
  };
}

// @ts-ignore
if (global.__DEV__ == undefined) {
  // @ts-ignore
  global.__DEV__ = true;
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8427b2" />
        <meta name="msapplication-TileColor" content="#8c42b4" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <QueryProvider>
        <Component {...pageProps} />
      </QueryProvider>
    </>
  );
}

export default MyApp;
