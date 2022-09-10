import {
  ActionButtonDef,
  Icon,
  IconButton,
  Spinner,
  useActionsSheet,
} from "@zerve/zen";
import { ComponentProps, ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export const NavigationBarWidth = 350;
export const PaneWidth = 400;
export const PaneMaxWidth = 500;

export function FeaturePane({
  title,
  children,
  spinner,
  actions,
  icon,
  onBack,
  footer,
}: {
  title: string;
  children: ReactNode;
  spinner?: boolean;
  actions?: ActionButtonDef[];
  icon?: null | ComponentProps<typeof Icon>["name"];
  onBack?: () => void;
  footer?: null | ReactNode;
}) {
  const [actionButton] = useActionsSheet(
    (onOpen: () => void) => (
      <IconButton
        icon={<Icon name="ellipsis-v" />}
        onPress={onOpen}
        altTitle="Options"
      />
    ),
    () => actions || [],
  );
  return (
    <View
      style={{
        borderRightWidth: 1,
        borderColor: "#00000033",
        width: PaneWidth,
        flex: 1,
      }}
    >
      <View style={{ minHeight: 80 }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{ fontSize: 28, color: "#464646", flex: 1, padding: 16 }}
          >
            {title}
          </Text>
          {actions ? actionButton : null}
        </View>
        {spinner && (
          <Spinner style={{ position: "absolute", right: 10, bottom: 10 }} />
        )}
      </View>
      <ScrollView
        style={{ backgroundColor: "#fafafa", flex: 1 }}
        contentContainerStyle={{}}
        scrollEnabled={true}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}
