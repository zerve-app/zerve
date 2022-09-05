import {
  StackActions,
  useNavigation as useReactNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnection } from "@zerve/zoo-client/Connection";
import { GenericError } from "@zerve/zed";
import { useMemo } from "react";
import { RootStackParamList } from "./Links";

export function useGlobalNavigation() {
  const { push, navigate } =
    useReactNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return useMemo(
    () => ({
      openRawJSON: (title: string, data: any) => {
        push("RawValue", { title, value: data });
      },
      openSchemaInput: (
        title: string,
        schema: any,
        value: any,
        onValue?: undefined | ((value: any) => void),
      ) => {
        push("JSONInput", { value, schema, onValue });
      },
      openHistory: () => {
        navigate("HomeStack", { screen: "History" });
      },
      openHistoryEvent: (eventId: string) => {
        navigate("HomeStack", { screen: "HistoryEvent", params: { eventId } });
      },
      openError: (error: GenericError<any, any>) => {
        navigate("Error", { error });
      },
    }),
    [],
  );
}

export function useConnectionNavigation() {
  const nav = useReactNavigation();
  const conn = useConnection();
  return useMemo(
    () => ({
      openZ: (path: string[]) => {
        const connection = conn?.key;
        if (!connection) throw new Error("Connection required to navigate");
        nav.push("HomeStack", {
          screen: "ZNode",
          params: { connection, path },
        });
      },
      closeZ: (path: string[]) => {
        nav.goBack();
      },
      backToZ: (path: string[]) => {
        nav.goBack();
      },
    }),
    [conn],
  );
}

export function useStoreNavigation(storePath: string[]) {
  const { navigate, dispatch } = useReactNavigation();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("Connection required to navigate");
  return useMemo(
    () => ({
      openEntry: (name: string) => {
        navigate("HomeStack", {
          screen: "Entry",
          params: { connection, storePath, name },
        });
      },
      openNewEntry: () => {
        navigate("HomeStack", {
          screen: "NewFile",
          params: { connection, storePath },
        });
      },
      openSchema: (schema: string) => {
        navigate("HomeStack", {
          screen: "StoreSchema",
          params: { connection, storePath, schema },
        });
      },
      openSchemas: () => {
        navigate("HomeStack", {
          screen: "StoreSchemas",
          params: { connection, storePath },
        });
      },
      openHistory: () => {
        navigate("HomeStack", {
          screen: "StoreHistory",
          params: { connection, storePath },
        });
      },

      replaceToEntry: (name: string) => {
        dispatch(
          StackActions.replace("Entry", {
            connection,
            storePath,
            name,
          }),
        );
      },
    }),
    [connection],
  );
}

export function useStoreFileNavigation(storePath: string[], fileName: string) {
  const { goBack, navigate, dispatch } = useReactNavigation();
  const conn = useConnection();
  const connection = conn?.key;
  if (!connection) throw new Error("Connection required to navigate");
  return useMemo(
    () => ({
      setEntryName: (fileName: string) => {},
      backTo: () => {
        goBack();
      },
      openSchema: () => {
        navigate("HomeStack", {
          screen: "FileSchema",
          params: { storePath, name: fileName, connection },
        });
      },
      leave: () => {
        goBack();
      },
    }),
    [],
  );
}

export function useStoreSchemaNavigation(
  storePath: string[],
  schemaName: string,
) {
  const { goBack } = useReactNavigation();

  return useMemo(
    () => ({
      leave: () => {
        goBack();
      },
      setSchemaName: (schemaName: string) => {},
    }),
    [],
  );
}
