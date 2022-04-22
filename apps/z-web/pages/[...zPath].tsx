import { useRouter } from "next/router";

import ZPathPage from "../components/ZPathPage";

export default function ZPathSpreadPage() {
  const router = useRouter();
  return (
    <ZPathPage
      path={
        Array.isArray(router.query.zPath)
          ? router.query.zPath
          : [router.query.zPath]
      }
    />
  );
}
