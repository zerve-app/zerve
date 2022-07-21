import {
  getWebRootServerProps,
  WebPathRootServerProps,
} from "@zerve/zoo/web/ZooWebServer";
import React from "react";
import myStore from "../zerve/AardvarkDev";

export default function HomeScreen(props: WebPathRootServerProps) {
  const isAllowed = myStore.AllowNewUsers.use();
  // useZ("AllowNewUsers");
  // const lol = myStore.useZ("test");
  return (
    <div>
      <h1>Zebra Web</h1>
      {isAllowed && <p>You are allowed to create new users</p>}
    </div>
  );
}

export const getServerSideProps = getWebRootServerProps;
