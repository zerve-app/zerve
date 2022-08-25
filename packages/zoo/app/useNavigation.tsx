import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useConnection } from "@zerve/client/Connection";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";
import { Title, useModal } from "@zerve/zen";
import { JSONSchemaEditor } from "@zerve/zen";
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
        schemaStore?: SchemaStore,
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
    [],
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
    [],
  );
}

export function useStoreNavigation(location: string[]) {
  const { push, replace } = useRouter();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("needs connection here ok");
  if (connection !== WEB_PRIMARY_CONN)
    throw new Error("Cannot navigate with this connection yet");
  return useMemo(
    () => ({
      openEntry: (entryName: string, path?: string[]) => {
        push(
          `/${location.join("/")}?_=entries-${entryName}${
            path?.length ? `-${path.join("-")}` : ""
          }`,
        );
      },
      openNewEntry: () => {
        push(`/${location.join("/")}?_=entries--create`);
      },
      openSchema: (schema: string, path?: string[]) => {
        push(
          `/${location.join("/")}?_=schemas-${schema}${
            path?.length ? `-${path.join("-")}` : ""
          }`,
        );
      },
      openSchemas: () => {
        push(`/${location.join("/")}?_=schemas`);
      },
      openHistory: () => {},
      replaceToEntry: (entryName: string, path?: string[]) => {
        replace(
          `/${location.join("/")}?_=entries-${entryName}${
            path?.length ? `-${path.join("-")}` : ""
          }`,
        );
      },
      openEntrySchema: (entryName: string, path?: string[]) => {
        push(
          `/${location.join("/")}?_=entries-${entryName}--schema${
            path?.length ? `-${path.join("-")}` : ""
          }`,
        );
      },
      replaceToEntries: () => {
        replace(`/${location.join("/")}?_=entries`);
      },
      replaceToEntrySchema: (entryName: string) => {
        replace(`/${location.join("/")}?_=entries-${entryName}--schema`);
      },
      replaceToSchema: (schemaName: string) => {
        replace(`/${location.join("/")}?_=schemas-${schemaName}`);
      },
    }),
    [],
  );
}

export function useStoreFileNavigation(storePath: string[], entryName: string) {
  const { push, pop } = useRouter();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("needs connection here ok");
  if (connection !== WEB_PRIMARY_CONN)
    throw new Error("Cannot navigate with this connection yet");
  return useMemo(
    () => ({
      setEntryName: (entryName: string) => {},
      openSchema: () => {
        push(`${storePath.join("/")}/$entries/${entryName}/$schema`);
      },
      leave: () => {
        push(`${storePath.join("/")}`);
      },
      backTo: () => {
        push(`${storePath.join("/")}/$entries/${entryName}`);
      },
    }),
    [],
  );
}

export function useStoreSchemaNavigation(
  storePath: string[],
  schemaName: string,
) {
  const { push, pop } = useRouter();
  return useMemo(
    () => ({
      leave: () => {
        push(`${storePath.join("/")}/$schemas`);
      },
      setSchemaName: (schemaName: string) => {},
    }),
    [],
  );
}
