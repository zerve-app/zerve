import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useConnection } from "@zerve/zoo-client/Connection";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";
import { SchemaStore } from "@zerve/zed";
import { useWebAuthModal } from "./AuthWeb";
import { JSONSchemaEditor } from "@zerve/zen/JSONSchemaEditor";
import { Title } from "@zerve/zen/Text";

function JSONInputModal({
  title,
  schema,
  value,
  schemaStore,
  onValue,
}: {
  title: string;
  schema: any;
  value: any;
  schemaStore: SchemaStore;
  onValue?: undefined | ((value: any) => void);
}) {
  const [v, setValue] = useState(value);

  return (
    <>
      <Title title={title} />
      <JSONSchemaEditor
        id={"uh"}
        schemaStore={schemaStore}
        value={v}
        schema={schema}
        onValue={
          onValue
            ? (v) => {
                setValue(v);
                onValue(v);
              }
            : undefined
        }
      />
    </>
  );
}

export function useGlobalNavigation() {
  const openAuth = useWebAuthModal();
  return useMemo(
    () => ({
      openAuthIn: (connection: string, path: string[]) => {
        openAuth({ connection, path });
      },
      openRawJSON: (title: string, data: any) => {},
      openHistory: () => {},
      openHistoryEvent: (eventId: string) => {},
      openError: (e: Error) => {},
    }),
    [],
  );
}

export function useConnectionNavigation() {
  const { push, pop, replace } = useRouter();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("needs connection here ok");
  if (connection !== WEB_PRIMARY_CONN)
    throw new Error("Cannot navigate with this connection yet");
  return useMemo(
    () => ({
      openZ: (path: string[]) => {
        push(path.join("/"));
      },
      replaceZ: (path: string[]) => {
        replace(path.join("/"));
      },
      closeZ: (path: string[]) => {
        const parent = path.slice(0, -1);
        push(parent.length ? parent.join("/") : "/");
      },
      backToZ: (path: string[]) => {
        push(path.join("/"));
      },
    }),
    [],
  );
}
