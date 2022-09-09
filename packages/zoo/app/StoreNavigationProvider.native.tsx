import {
  StackActions,
  UNSTABLE_usePreventRemove,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ReactNode, useMemo } from "react";
import { useDiscardChangesDialog } from "../components/useDiscardChangesDialog";
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
import { useAppLocation } from "./Location";
import { useUnsavedContext } from "./Unsaved";

const arrayEquals = (a, b) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export function StoreNavigationProvider({
  connection,
  storePath,
  feature,
  render,
}: {
  connection: string | null;
  storePath: string[];
  feature: StoreNavigationState;
  render: (props: { isActive: boolean }) => ReactNode;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "HomeStack">>();
  const { dirtyId, discardDirty } = useUnsavedContext();
  const openDiscardChangesDialog = useDiscardChangesDialog(() => {
    discardDirty();
  });
  // UNSTABLE_usePreventRemove(!!dirtyId);
  // useEffect(() => {
  //   function beforeRemoveHandler(e) {
  //     const { action, destinationRoute } = e.data;
  //     function interruptNavigation() {
  //       e.preventDefault();
  //       openDiscardChangesDialog(() => {
  //         navigation.dispatch(action);
  //       });
  //     }
  //     if (destinationRoute === null) {
  //       if (dirtyId) interruptNavigation();
  //       return;
  //     }
  //     if (dirtyId && destinationRoute.name !== "StoreFeature") {
  //       interruptNavigation();
  //       return;
  //     }
  //     const { feature } = destinationRoute.params;
  //     if (!allowedToNavigateToFeatureWithDirty(feature, dirtyId)) {
  //       interruptNavigation();
  //       return;
  //     }
  //   }
  //   navigation.addListener("beforeRemove", beforeRemoveHandler);
  //   return () => {
  //     navigation.removeListener("beforeRemove", beforeRemoveHandler);
  //   };
  // }, [dirtyId]);
  // const [feature, setFeature] = useState<null | StoreNavigationState>(null);
  const location = useAppLocation();
  const fragment =
    location?.connection === connection &&
    !!location.path &&
    arrayEquals(location.path, storePath) &&
    !!location.storeFeature
      ? location.storeFeature
      : null;

  const ctx = useMemo(
    (): FragmentContext<StoreNavigationState> => ({
      fragment,
      fragmentString: fragment ? stringifyFeatureFragment(fragment) : "",
      navigateFragment(feature, shouldReplace?) {
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
    [fragment],
  );
  const isActive = fragment === feature;
  return (
    <StoreDashboardContext.Provider value={ctx}>
      {render({ isActive })}
    </StoreDashboardContext.Provider>
  );
}
