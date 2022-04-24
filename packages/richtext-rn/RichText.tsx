import React from "react";
import { EditorBundleData } from "./EditorBundleData";

import { WebView } from "react-native-webview";

export function RichTextInput() {
  const html = `<div id="editor"></div><script>
  function rnMessage(o) {
    window.ReactNativeWebView.postMessage(JSON.stringify(o));
  }
  
  // alert("browserjs ready");
  
  
  </script>`;

  return (
    <WebView
      style={{ flex: 1, backgroundColor: "blue" }}
      originWhiteList={["*"]}
      onLoadEnd={() => {
        console.log("load end");
      }}
      onLoad={() => {
        console.log("load end");
      }}
      onContentSizeChange={() => {
        console.log("content size changed");
      }}
      javaScriptEnabled={true}
      onError={() => {
        console.log("webview error");
      }}
      onMessage={(event) => {
        console.log("WebView Message!");
        console.log(JSON.stringify(event.nativeEvent.data));
      }}
      onLayout={() => {
        console.log("layout changed");
      }}
      source={{
        html,
      }}
      allowFileAccess={true}
      injectedJavaScript={EditorBundleData}
      // injectedJavaScriptBeforeContentLoaded={``}
      onNavigationStateChange={(e) => {}}
    />
  );
}
