import Head from "next/head";
import "raf/polyfill";
import { AppProps } from "next/app";
import { ModalProvider, ToastPresenter } from "@zerve/zen";
import { SafeAreaContextProvider } from "@zerve/zen";

// FIXME need reanimated update, see https://github.com/software-mansion/react-native-reanimated/issues/3355
// @ts-ignore
if (process.browser) {
  // @ts-ignore
  window._frameTimestamp = null;
}

export default function ZooNextApp({ Component, pageProps }: AppProps) {
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
        <style
          // this is terrible of course. we should somehow associate css with @zerve/zen/HumanTextInput
          dangerouslySetInnerHTML={{
            __html: `
.HumanTextEditorContent {
}
.HumanTextEditorContent > div {
  padding: 1px 12px;
}
.HumanTextEditorContent p {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
}
.HumanTextEditorContent code {
  background-color: #dbceea;
  padding: 2px;
  border-radius: 2px;
}
.HumanTextEditorContent a {
  color: blue;
}
`,
          }}
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8427b2" />
        <meta name="msapplication-TileColor" content="#8c42b4" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <SafeAreaContextProvider>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
        <ToastPresenter />
      </SafeAreaContextProvider>
    </>
  );
}
