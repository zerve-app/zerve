import { useRouter } from "next/router";

import FSPage from "../../components/FSPage";

export default function FSSpreadPage() {
  const router = useRouter();
  const { fsPath } = router.query;
  const pathTerms = Array.isArray(fsPath) ? fsPath : [fsPath];
  return <FSPage pathTerms={pathTerms} />;
}
