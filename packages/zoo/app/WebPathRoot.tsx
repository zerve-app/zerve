import {
  SavedConnection,
  SavedConnectionProvider,
} from "@zerve/client/Connection";
import { FileFeature } from "../features/StoreFileFeature";
import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { useWebConnection, WEB_PRIMARY_CONN } from "./ConnectionStorage";

function getPathFeature(path: string[]): () => JSX.Element | null {
  const filesPathIndex = path.indexOf("$files");
  if (filesPathIndex !== -1) {
    const storePath = [...path].splice(0, filesPathIndex);
    const name = path[filesPathIndex + 1];
    return () => (
      <FileFeature
        name={name}
        storePath={storePath}
        connection={WEB_PRIMARY_CONN}
      />
    );
  }

  const schemasPathIndex = path.indexOf("$schemas");
  if (schemasPathIndex !== -1) {
    const storePath = [...path].splice(0, schemasPathIndex);
    return () => (
      <StoreSchemasFeature
        storePath={storePath}
        connection={WEB_PRIMARY_CONN}
      />
    );
  }
  return () => <ZFeature path={path} connection={WEB_PRIMARY_CONN} />;
}

export type WebPathRootProps = WebPathRootServerProps & {
  path: string[];
};

export function WebPathRoot({ path, config }: WebPathRootProps) {
  const renderFeature = getPathFeature(path);
  const conn = useWebConnection(config);
  return (
    <SavedConnectionProvider value={conn}>
      <PageLayout>{renderFeature()}</PageLayout>
    </SavedConnectionProvider>
  );
}
