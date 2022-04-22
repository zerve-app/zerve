import Head from "next/head";
import { Title } from "@zerve/ui";
import { PageLayout } from "../components/PageLayout";
import { getFromStore } from "../stores/getFromStore";
import ZPathPage from "../components/ZPathPage";

export default function Web() {
  return <ZPathPage path={[]} />;
}

// export async function getServerSideProps() {
//   return {
//     props: {
//       banner: await getFromStore("Home_Banner"),
//     },
//   };
// }
