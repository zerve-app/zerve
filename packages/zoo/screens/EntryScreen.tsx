import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreEntriesEntryFeature
          storePath={storePath}
          path={[]}
          entryName={name}
          href={"lol"}
          storeId={"not used"}
          title="ff"
        />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
