import { ActionButtonDef, Icon, IconButton, useActionsSheet } from "@zerve/zen";
import { ComponentProps, ReactNode } from "react";
import { View } from "react-native";
import ScreenContainer from "./ScreenContainer";
import ScreenHeader from "./ScreenHeader";

export const NavigationBarWidth = 300;
export const PaneWidth = 400;
export const PaneMaxWidth = 500;

export function FeaturePane({
  title,
  icon,
  children,
  spinner,
  actions,
  onBack,
}: {
  title: string;
  icon: null | ComponentProps<typeof Icon>["name"];
  children: ReactNode;
  spinner?: boolean;
  actions?: ActionButtonDef[];
  onBack?: () => void;
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
    <ScreenContainer scroll>
      <ScreenHeader
        title={title}
        icon={icon}
        isLoading={spinner}
        onBack={onBack}
        corner={actions && actions.length ? actionButton : null}
      />
      <View style={{ backgroundColor: "#fafafa", flex: 1 }}>{children}</View>
    </ScreenContainer>
  );
}
