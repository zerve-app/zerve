import { RootStackParamList, SettingsStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { setConnections, useSavedConnections } from "../app/ConnectionStorage";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { Padding } from "@zerve/zen/Stack";
import { Button } from "@zerve/zen/Button";
import { Icon } from "@zerve/zen/Icon";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import { OrderableButtons } from "@zerve/zen/OrderableButtons";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, "Connections">,
  NativeStackNavigationProp<RootStackParamList, "SettingsStack">
>;

export default function ConnectionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const connections = useSavedConnections();
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Connections" />
      <OrderableButtons
        data={connections}
        onData={setConnections}
        onPress={(item) => {
          navigation.navigate("ConnectionInfo", {
            connection: item.key,
          });
        }}
        getKey={(c) => c.key}
        getName={(c) => c.name}
        getIcon={() => "link"}
      />
      <Padding>
        <Button
          onPress={() => {
            navigation.navigate("NewConnection");
          }}
          left={(props) => <Icon name="plus-circle" {...props} />}
          primary
          title="New Connection"
        />
      </Padding>
    </ScreenContainer>
  );
}
