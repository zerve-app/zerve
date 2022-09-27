import { ComponentFactory, ReactNode, useMemo } from "react";
import { RootStackParamList, SettingsStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  reorderConnection,
  useSavedConnections,
} from "../app/ConnectionStorage";
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Connection } from "@zerve/zoo-client/Connection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { insetsPadding } from "@zerve/zen/InsetUtils";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { useColors } from "@zerve/zen/useColors";
import { LinkRow } from "@zerve/zen/Row";
import { Padding } from "@zerve/zen/Stack";
import { Button } from "@zerve/zen/Button";

function ConnectionsScreenHeader() {
  return <ScreenHeader title="Connections" />;
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, "Connections">,
  NativeStackNavigationProp<RootStackParamList, "SettingsStack">
>;

function ConnectionsScreenFooter() {
  const navigation = useNavigation<NavigationProp>();
  return (
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
  );
}

type KeyedObject = {
  key: string;
};
function OrderScreenContainer<Item extends KeyedObject>({
  data,
  Footer,
  renderItem,
  onMove,
}: {
  data: Item[];
  Footer?: ComponentFactory<{}, any>;
  renderItem: (params: RenderItemParams<Item>) => ReactNode;
  onMove: (fromIndex: number, toIndex: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const renderInsideItem = useMemo(
    () => (item) => {
      return (
        <ShadowDecorator>
          <ScaleDecorator>{renderItem(item)}</ScaleDecorator>
        </ShadowDecorator>
      );
    },
    [renderItem],
  );
  return (
    <DraggableFlatList
      style={{
        backgroundColor: colors.backgroundDim,
      }}
      ListHeaderComponent={ConnectionsScreenHeader}
      contentContainerStyle={{
        flex: 1,
        ...insetsPadding(insets),
      }}
      data={data}
      activationDistance={10}
      containerStyle={{ flex: 1 }}
      onDragEnd={(e) => {
        if (e.from !== e.to) {
          onMove(e.from, e.to);
        }
      }}
      keyExtractor={(item) => item.key}
      renderItem={renderInsideItem}
      ListFooterComponent={Footer}
    />
  );
}

export default function ConnectionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const connections = useSavedConnections();
  return (
    <OrderScreenContainer<Connection>
      data={connections}
      renderItem={({ item, drag, isActive }) => (
        <Padding>
          <LinkRow
            key={item.key}
            title={item.name}
            icon="link"
            onLongPress={drag}
            disabled={isActive}
            onPress={() => {
              navigation.navigate("ConnectionInfo", {
                connection: item.key,
              });
            }}
          />
        </Padding>
      )}
      Footer={ConnectionsScreenFooter}
      onMove={reorderConnection}
    />
  );
}
