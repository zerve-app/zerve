import { StackActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ReactNode, useMemo } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { FragmentContext } from "../web/Fragment";
import { RootStackParamList } from "./Links";

export function StoreNavigationProvider({
  connection,
  storePath,
  children,
}: {
  connection: string | null;
  storePath: string[];
  children: ReactNode;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "HomeStack">>();

  const ctx = useMemo(
    (): FragmentContext<StoreNavigationState> => ({
      fragment: { key: "entries" },
      fragmentString: "",
      navigateFragment(fragmentState, shouldReplace?) {
        console.log("NAV TO", fragmentState);
        if (shouldReplace) {
          navigation.dispatch(
            StackActions.replace("StoreFeature", {
              feature: fragmentState,
              connection,
              storePath,
            }),
          );
        } else {
          navigation.dispatch(
            StackActions.push("StoreFeature", {
              feature: fragmentState,
              connection,
              storePath,
            }),
          );
        }
      },
      parseFragment(fragment) {
        return null;
      },
      stringifyFragment(feature) {
        return "";
      },
    }),
    [],
  );
  return (
    <StoreDashboardContext.Provider value={ctx}>
      {children}
    </StoreDashboardContext.Provider>
  );
}
