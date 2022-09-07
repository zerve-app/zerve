import { StackActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useDiscardChangesDialog } from "../components/useDiscardChangesDialog";
import {
  StoreDashboardContext,
  StoreNavigationState,
  useUnsavedContext,
} from "../context/StoreDashboardContext";
import {
  allowedToNavigateToFeatureWithDirty,
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
  const { dirtyId, discardDirty } = useUnsavedContext();
  const openDiscardChangesDialog = useDiscardChangesDialog(() => {
    discardDirty();
  });
  useEffect(() => {
    function beforeRemoveHandler(e) {
      const { action, destinationRoute } = e.data;
      function interruptNavigation() {
        e.preventDefault();
        openDiscardChangesDialog(() => {
          navigation.dispatch(action);
        });
      }
      if (destinationRoute === null) {
        if (dirtyId) interruptNavigation();
        return;
      }
      if (dirtyId && destinationRoute.name !== "StoreFeature") {
        interruptNavigation();
        return;
      }
      const { feature } = destinationRoute.params;
      if (!allowedToNavigateToFeatureWithDirty(feature, dirtyId)) {
        interruptNavigation();
        return;
      }
    }
    navigation.addListener("beforeRemove", beforeRemoveHandler);
    return () => {
      navigation.removeListener("beforeRemove", beforeRemoveHandler);
    };
  }, [dirtyId]);
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
