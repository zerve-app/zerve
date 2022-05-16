import { ConnectionProvider, useZNode } from "@zerve/query";
import { Paragraph, Spinner, Title } from "@zerve/zen";
import Head from "next/head";
import { FileFeature } from "../features/FileFeature";
import { PageLayout } from "../components/PageLayout";
import { ZLoadedNode } from "../components/ZLoadedNode";
import { ZFeature } from "../features/ZFeature";

const webConnectionTEMP = __DEV__ ? "dev" : "main";

function getPathFeature(path: string[]): () => JSX.Element | null {
  const filesPathIndex = path.indexOf("$files");

  if (filesPathIndex !== -1) {
    const storePath = [...path].splice(0, filesPathIndex);
    return () => (
      <FileFeature
        name={path[filesPathIndex + 1]}
        storePath={storePath}
        connection={webConnectionTEMP}
      />
    );
  }
  return () => <ZFeature path={path} connection={webConnectionTEMP} />;
}

export function WebPathRoot({ path }: { path: string[] }) {
  const renderFeature = getPathFeature(path);
  return <PageLayout>{renderFeature()}</PageLayout>;
}
