import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { WebPageProvider } from "../web/WebPageProvider";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";

function getPathFeature(path: string[]): () => JSX.Element | null {
  return () => <ZFeature path={path} connection={WEB_PRIMARY_CONN} />;
}

export type WebPathRootProps = WebPathRootServerProps & {
  path: string[];
};

export function WebPathRoot({ path, config }: WebPathRootProps) {
  const renderFeature = getPathFeature(path);
  return (
    <WebPageProvider config={config}>
      <PageLayout>{renderFeature()}</PageLayout>
    </WebPageProvider>
  );
}
