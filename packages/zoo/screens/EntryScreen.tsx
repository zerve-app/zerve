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
import { StoreEntriesEntryFeature } from "../features/StoreEntriesEntryFeature";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Entry">
>;

export default function FileScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Entry">) {
  const { connection, name, storePath } = route.params;
  throw new Error(
    "Not baked yet. put it back in the oven! no really, go make the props and context correct for StoreEntriesEntryFeature",
  );
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreEntriesEntryFeature
          name={name}
          connection={connection}
          storePath={storePath}
        />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
