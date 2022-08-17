import React, { ComponentFactory, ReactNode, useMemo } from "react";
import { AbsoluteFill, Button, LinkRow, Padding, VStack } from "@zerve/zen";

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
import { FontAwesome } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useSafeArea } from "../provider/SafeArea/useSafeArea";
import { Connection } from "@zerve/client/Connection";

function ConnectionsScreenHeader() {
  return <ScreenHeader title="Connections" />;
}

function ConnectionsScreenFooter() {
  const navigation = useNavigation();
  return (
    <Padding>
      <Button
        onPress={() => {
          navigation.navigate("NewConnection");
        }}
        left={({ color }) => (
          <FontAwesome name="plus-circle" color={color} size={24} />
        )}
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
  const safeAreaInsets = useSafeArea();
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
      ListHeaderComponent={ConnectionsScreenHeader}
      contentInset={safeAreaInsets}
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
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList, "HomeStack">,
        NativeStackNavigationProp<SettingsStackParamList, "Connections">
      >
    >();

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
