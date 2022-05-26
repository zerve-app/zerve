import { SavedConnectionProvider } from "@zerve/client/Connection";
import { FileFeature } from "../features/StoreFileFeature";
import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";
import { StoreSchemaFeature } from "../features/StoreSchemaFeature";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { useWebConnection, WEB_PRIMARY_CONN } from "./ConnectionStorage";
import { NewFileFeature } from "../features/NewFileFeature";
import { StoreFileSchemaFeature } from "../features/StoreFileSchemaFeature";

function getPathFeature(path: string[]): () => JSX.Element | null {
  const filesPathIndex = path.indexOf("$files");
  if (filesPathIndex !== -1) {
    const storePath = [...path].splice(0, filesPathIndex);
    const name = path[filesPathIndex + 1];
    const isSchema = path[filesPathIndex + 2] === "$schema";
    if (isSchema)
      return () => <StoreFileSchemaFeature name={name} storePath={storePath} />;
    return () => <FileFeature name={name} storePath={storePath} />;
  }

  const newPathIndex = path.indexOf("$new");
  if (newPathIndex !== -1) {
    const storePath = [...path].splice(0, newPathIndex);
    return () => <NewFileFeature storePath={storePath} />;
  }

  const schemasPathIndex = path.indexOf("$schemas");
  if (schemasPathIndex !== -1) {
    const storePath = [...path].splice(0, schemasPathIndex);
    const schemaKey = path[schemasPathIndex + 1];
    if (schemaKey)
      return () => (
        <StoreSchemaFeature storePath={storePath} schema={schemaKey} />
      );
    return () => <StoreSchemasFeature storePath={storePath} />;
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
