import {
  SavedConnection,
  SavedConnectionProvider,
} from "@zerve/client/Connection";
import { FileFeature } from "../features/StoreFileFeature";
import { PageLayout } from "../components/PageLayout";
import { ZFeature } from "../features/ZFeature";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";
import { SiteConfig } from "./SiteConfig";
import { WebPathRootServerProps } from "../web/ZooWebServer";
import { useMemo } from "react";
import { useSavedConnection } from "./ConnectionStorage";

const WEB_PRIMARY_CONN = __DEV__ ? "dev" : "main";

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

function useWebConn(config: SiteConfig): SavedConnection {
  const savedConn = useSavedConnection(WEB_PRIMARY_CONN);
  const conn = useMemo(() => {
    return (
      savedConn || {
        key: WEB_PRIMARY_CONN,
        name: config?.name ? config.name : "Main",
        url: config.origin,
        session: null,
      }
    );
  }, [savedConn]);

  return conn;
}

export function WebPathRoot({ path, config }: WebPathRootProps) {
  const renderFeature = getPathFeature(path);
  const conn = useWebConn(config);
  return (
    <SavedConnectionProvider value={conn}>
      <PageLayout>{renderFeature()}</PageLayout>
    </SavedConnectionProvider>
  );
}
