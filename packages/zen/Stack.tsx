import { ReactNode, Children } from "react";
import { View, ViewStyle } from "react-native";

export function HStack({
  children,
  padded,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 6,
        paddingVertical: padded ? 12 : 0,
      }}
    >
      {Children.map(children, (el) => (
        <View style={{ flex: 1, marginHorizontal: 6 }}>{el}</View>
      ))}
    </View>
  );
}

export function Padding({ children }: { children: ReactNode }) {
  return <View style={{ margin: 12 }}>{children}</View>;
}

export function VSpaced({
  space = 1,
  children,
}: {
  space?: number;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        paddingVertical: space * 10,
      }}
    >
      {children}
    </View>
  );
}

export function Spacer() {
  return <View style={{ flex: 1 }} />;
}

export function VStack({
  children,
  style,
  padded,
}: {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "column",
          paddingVertical: 6,
          paddingHorizontal: padded ? 12 : 0,
        },
        style,
      ]}
    >
      {Children.map(children, (el) =>
        el === null ? null : (
          <View
            style={{
              marginVertical: 6,
            }}
          >
            {el}
          </View>
        ),
      )}
    </View>
  );
}
