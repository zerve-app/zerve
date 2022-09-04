import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FileFeature } from "../features/StoreFileFeature";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "File">
>;

export default function FileScreen({
  navigation,
  route,
}: HomeStackScreenProps<"File">) {
  const { connection, name, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <FileFeature
          name={name}
          connection={connection}
          storePath={storePath}
        />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
