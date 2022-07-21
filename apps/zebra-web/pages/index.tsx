import React from "react";
import { AllowNewUsers } from "../zerve/AardvarkDev";

export default function HomeScreen() {
  const { data: isAllowed } = AllowNewUsers.use();
  return (
    <div>
      <h1>Zebra Web</h1>
      {isAllowed && <p>You are allowed to create new users</p>}
    </div>
  );
}

export const getServerSideProps = async () => {
  const isAllowed = await AllowNewUsers.get();
  console.log({ isAllowed });
  return { props: {} };
};
