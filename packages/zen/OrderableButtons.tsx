import { ComponentProps } from "react";
import {
  NestableDraggableFlatList,
  ScaleDecorator,
  ShadowDecorator,
} from "react-native-draggable-flatlist";
import { Icon } from "./Icon";
import { LinkRow } from "./Row";
import { Padding } from "./Stack";

export function OrderableButtons<Spec>({
  data,
  onPress,
  onData,
  getKey,
  getName,
  getIcon,
}: {
  data: Spec[];
  onPress: (item: Spec) => void;
  onData: (data: Spec[]) => void;
  getKey: (item: Spec) => string;
  getName: (item: Spec) => string;
  getIcon: (item: Spec) => ComponentProps<typeof Icon>["name"];
}) {
  return (
    <NestableDraggableFlatList
      keyExtractor={getKey}
      data={data}
      onDragEnd={({ data }) => onData(data)}
      activationDistance={10}
      renderItem={({ item, drag, isActive }) => (
        <ShadowDecorator>
          <ScaleDecorator>
            <Padding>
              <LinkRow
                key={getKey(item)}
                title={getName(item)}
                icon={getIcon(item)}
                onLongPress={drag}
                disabled={isActive}
                onPress={() => {
                  onPress(item);
                }}
              />
            </Padding>
          </ScaleDecorator>
        </ShadowDecorator>
      )}
    />
  );
}
