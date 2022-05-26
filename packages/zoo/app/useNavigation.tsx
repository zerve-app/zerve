import { useMemo } from "react";
import { useRouter } from "next/router";
import { useConnection } from "@zerve/client/Connection";
import { WEB_PRIMARY_CONN } from "./ConnectionStorage";

// const { push, back } = useRouter();
//     navigate: (routeName: string, params: {}) => {
//       if (routeName === "File") {
//         const path = `/${params.storePath.join("/")}/$files/${params.name}`;
//         push(path);
//       } else if (routeName === "NewFile") {
//         push(`/${params.storePath.join("/")}/$new-file`);
//       } else if (routeName === "StoreHistory") {
//         push(`/${params.storePath.join("/")}/$history`);
//       } else if (routeName === "StoreSchemas") {
//         push(`/${params.storePath.join("/")}/$schemas`);
//       } else if (routeName === "StoreSchema") {
//         push(`/${params.storePath.join("/")}/$schemas/${params.schema}`);
//       } else {
//         console.error("Navigate not implemented here!", routeName, params);
//       }
//     },
//     dispatch: (action) => {
//       const { payload, type } = action;
//       if (type === "PUSH" && payload.name === "ZNode") {
//         const path = `/${payload.params.path.join("/")}`;
//         push(path);
//       } else if (type === "BACK") {
//         back();
//       } else {
//         console.error("Dispatch not implemented here!", action);
//       }

export function useGlobalNavigation() {
  return useMemo(
    () => ({
      openRawJSON: (title: string, data: any) => {},
      openSchemaInput: (
        title: string,
        schema: any,
        value: any,
        onValue?: undefined | ((value: any) => void)
      ) => {},
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
        push(parent.join("/"));
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
