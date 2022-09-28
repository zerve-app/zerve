import { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { ActionButtonDef } from "./ActionButton";
import { useActionsSheet } from "./ActionButtonSheet";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";
import { useColors } from "./useColors";

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
  isActive,
  footer,
}: {
  title: string;
  children: ReactNode;
  spinner?: boolean;
  actions?: ActionButtonDef[];
  icon?: null | ComponentProps<typeof Icon>["name"];
  onBack?: () => void;
  isActive?: boolean;
  footer?: null | ReactNode;
}) {
  const colors = useColors();
  const [actionButton] = useActionsSheet(
    (onOpen: () => void) => (
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="ellipsis-v" />
      </View>
    ),
    actions || [],
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
      <View
        style={{
          minHeight: 80,
          backgroundColor: isActive ? colors.background : colors.backgroundDim,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: !!icon ? 16 : 0,
          }}
        >
          {icon ? <Icon name={icon} /> : null}
          <Text
            style={{
              fontSize: 28,
              color: "#464646",
              flex: 1,
              padding: 16,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {actions ? actionButton : null}
        </View>
        {spinner && (
          <Spinner style={{ position: "absolute", right: 10, bottom: 10 }} />
        )}
      </View>
      <NestableScrollContainer
        style={{ backgroundColor: colors.backgroundDim, flex: 1 }}
        contentContainerStyle={{}}
        scrollEnabled={true}
      >
        {children}
      </NestableScrollContainer>
      {footer}
    </View>
  );
}
