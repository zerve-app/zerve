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
      replaceZ: (path: string[]) => {
        const connection = conn?.key;
        if (!connection) throw new Error("Connection required to navigate");
        nav.dispatch(
          StackActions.replace("ZNode", {
            connection,
            path,
          }),
        );
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
