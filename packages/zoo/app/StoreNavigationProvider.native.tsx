import { StackActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ReactNode, useMemo, useState } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import {
  parseFeatureFragment,
  stringifyFeatureFragment,
} from "../features/StoreFeatures";
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

  const [feature, setFeature] = useState<null | StoreNavigationState>(null);
  const ctx = useMemo(
    (): FragmentContext<StoreNavigationState> => ({
      fragment: feature,
      fragmentString: feature ? stringifyFeatureFragment(feature) : "",
      navigateFragment(feature, shouldReplace?) {
        setFeature(feature);
        if (shouldReplace) {
          navigation.dispatch(
            StackActions.replace("StoreFeature", {
              feature: feature,
              connection,
              storePath,
            }),
          );
        } else {
          navigation.dispatch(
            StackActions.push("StoreFeature", {
              feature: feature,
              connection,
              storePath,
            }),
          );
        }
      },
      parseFragment(fragment) {
        return parseFeatureFragment(fragment);
      },
      stringifyFragment(feature) {
        return stringifyFeatureFragment(feature);
      },
    }),
    [feature],
  );
  return (
    <StoreDashboardContext.Provider value={ctx}>
      {children}
    </StoreDashboardContext.Provider>
  );
}
