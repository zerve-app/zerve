import { ConnectionProvider } from "@zerve/zoo-client/Connection";
import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { useWebConnection, WEB_PRIMARY_CONN } from "./ConnectionStorage";

function getPathFeature(path: string[]): () => JSX.Element | null {
  return () => <ZFeature path={path} connection={WEB_PRIMARY_CONN} />;
}

export type WebPathRootProps = WebPathRootServerProps & {
  path: string[];
};

export function WebPathRoot({ path, config }: WebPathRootProps) {
  const renderFeature = getPathFeature(path);
  const conn = useWebConnection(config);
  return (
    <ConnectionProvider value={conn}>
      <PageLayout>{renderFeature()}</PageLayout>
    </ConnectionProvider>
  );
}
