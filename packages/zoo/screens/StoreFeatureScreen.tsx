import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreNavigationProvider } from "../app/StoreNavigationProvider";
import {
  getFeatureIcon,
  getFeatureTitle,
  renderFeature,
} from "../features/StoreFeatures";
import { ModalProvider } from "@zerve/zen";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "StoreFeature">,
  NativeStackNavigationProp<RootStackParamList, "HomeStack">
>;

export default function StoreFeatureScreen({
  route,
}: HomeStackScreenProps<"StoreFeature">) {
  const { connection, storePath, feature } = route.params;
  const { pop, push } = useNavigation<NavigationProp>();
  return (
    <ConnectionKeyProvider value={connection}>
      <StoreNavigationProvider connection={connection} storePath={storePath}>
        <ModalProvider>
          {renderFeature({
            storePath,
            isActive: true,
            feature,
            title: getFeatureTitle(feature),
            icon: getFeatureIcon(feature),
            onBack: () => {
              pop();
            },
            onStoreDelete: () => {
              // not good because we assume the current nav state
              // replace with popTo after ReactNav7
              pop();
              pop();
            },
            onStoreRename: (newName: string) => {
              pop();
              pop();
              push("StoreFeature", {
                feature: { key: "entries" },
                connection,
                storePath: [...storePath.slice(0, -1), newName],
              });
            },
          })}
        </ModalProvider>
      </StoreNavigationProvider>
    </ConnectionKeyProvider>
  );
}
