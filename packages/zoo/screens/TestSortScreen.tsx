import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { useSafeArea } from "../provider/SafeArea/useSafeArea";
import { Input, showToast } from "@zerve/zen";

const NUM_ITEMS = 10;
function getColor(i: number) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

type Item = {
  key: string;
  label: string;
  height: number;
  backgroundColor: string;
};

const initialData: Item[] = [...Array(NUM_ITEMS)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${index}`,
    label: String(index) + "",
    height: 50 + Math.random() * 200,
    backgroundColor,
  };
});

function TestSortHeader() {
  return <ScreenHeader title="Sorting Test" />;
}

function TestSortPage() {
  const [data, setData] = useState(initialData);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
    return (
      <ShadowDecorator>
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            onPress={() => {
              showToast("row pressed");
            }}
            style={[
              styles.rowItem,
              {
                backgroundColor: item.backgroundColor,
                height: item.height,
              },
            ]}
          >
            <Text style={styles.text}>{item.label}</Text>
            <TouchableOpacity
              onLongPress={() => {
                showToast("long pressed");
              }}
              style={[]}
              onPress={() => {
                showToast("pressed");
              }}
            >
              <Text>Long Press me</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </ScaleDecorator>
      </ShadowDecorator>
    );
  };

  const safeAreaInsets = useSafeArea();
  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        ListHeaderComponent={TestSortHeader}
        contentInset={safeAreaInsets}
        data={data}
        activationDistance={10}
        onDragEnd={(e) => {
          if (e.from !== e.to) {
            setData(e.data);
          }
        }}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
      />
    </View>
  );
}

export default function TestSortScreen() {
  return (
    <ScreenContainer>
      <TestSortPage />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rowItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
