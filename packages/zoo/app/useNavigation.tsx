import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useConnection } from "@zerve/client/Connection";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";
import { Title, useModal } from "@zerve/zen";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import { EmptySchemaStore, SchemaStore } from "@zerve/core";

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
  const openInputModal = useModal<{
    title: string;
    schema: any;
    value: any;
    onValue?: undefined | ((value: any) => void);
    schemaStore: SchemaStore;
  }>(({ onClose, options }) => <JSONInputModal {...options} />);
  return useMemo(
    () => ({
      openRawJSON: (title: string, data: any) => {},
      openSchemaInput: (
        title: string,
        schema: any,
        value: any,
        onValue?: undefined | ((value: any) => void),
        schemaStore?: SchemaStore
      ) => {
        openInputModal({
          title,
          schema,
          value,
          onValue,
          schemaStore: schemaStore || EmptySchemaStore,
        });
      },
      openHistory: () => {},
      openHistoryEvent: (eventId: string) => {},
      openError: (e: Error) => {},
    }),
    []
  );
}

export function useConnectionNavigation() {
  const { push, pop } = useRouter();
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
      closeZ: (path: string[]) => {
        const parent = path.slice(0, -1);
        push(parent.length ? parent.join("/") : "/");
      },
      backToZ: (path: string[]) => {
        push(path.join("/"));
      },
    }),
    []
  );
}

export function useStoreNavigation(storePath: string[]) {
  const { push, pop } = useRouter();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("needs connection here ok");
  if (connection !== WEB_PRIMARY_CONN)
    throw new Error("Cannot navigate with this connection yet");
  return useMemo(
    () => ({
      openFile: (fileName: string) => {
        push(`${storePath.join("/")}/$files/${fileName}`);
      },
      openNewFile: () => {
        push(`${storePath.join("/")}/$new`);
      },
      openSchema: (schema: string) => {
        push(`${storePath.join("/")}/$schemas/${schema}`);
      },
      openSchemas: () => {
        push(`${storePath.join("/")}/$schemas`);
      },
      openHistory: () => {},
      replaceToFile: (fileName: string) => {
        push(`${storePath.join("/")}/$files/${fileName}`);
      },
    }),
    []
  );
}

export function useStoreFileNavigation(storePath: string[], fileName: string) {
  const { push, pop } = useRouter();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("needs connection here ok");
  if (connection !== WEB_PRIMARY_CONN)
    throw new Error("Cannot navigate with this connection yet");
  return useMemo(
    () => ({
      setFileName: (fileName: string) => {},
      openSchema: () => {
        push(`${storePath.join("/")}/$files/${fileName}/$schema`);
      },
      leave: () => {
        push(`${storePath.join("/")}`);
      },
      backTo: () => {
        push(`${storePath.join("/")}/$files/${fileName}`);
      },
    }),
    []
  );
}

export function useStoreSchemaNavigation(
  storePath: string[],
  schemaName: string
) {
  const { push, pop } = useRouter();
  return useMemo(
    () => ({
      leave: () => {
        push(`${storePath.join("/")}/$schemas`);
      },
      setSchemaName: (schemaName: string) => {},
    }),
    []
  );
}
