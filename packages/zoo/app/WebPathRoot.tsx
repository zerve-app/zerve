import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { WebPageProvider } from "../web/WebPageProvider";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";

export type WebPathRootProps = WebPathRootServerProps & {
  path: string[];
};

export function WebPathRoot({ path, config }: WebPathRootProps) {
  return (
    <WebPageProvider config={config}>
      <ZFeature path={path} connection={WEB_PRIMARY_CONN} />
    </WebPageProvider>
  );
}
