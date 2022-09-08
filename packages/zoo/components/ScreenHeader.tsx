import { ComponentProps, ReactNode } from "react";
import { Icon, Spacer, Spinner, Title, useColors } from "@zerve/zen";
import { View } from "react-native";
import { BackButton } from "./BackButton";
import { Pressable } from "react-native";

const MAX_OVERSCROLL_PLUS_LOGO_HEIGHT = 800;

export default function ScreenHeader({
  title,
  isLoading,
  backButtonCancelStyle,
  corner,
  icon,
  onLongPress,
  onBack,
}: {
  title: string;
  backButtonCancelStyle?: boolean;
  isLoading?: boolean;
  corner?: ReactNode;
  icon?: null | ComponentProps<typeof Icon>["name"];
  onLongPress?: () => void;
  onBack?: (() => void) | null;
}) {
  const colors = useColors();
  return (
    <View style={{}}>
      <View
        style={{
          backgroundColor: colors.background,
          // make sure this header color is visible on iOS overscroll:
          marginTop: -MAX_OVERSCROLL_PLUS_LOGO_HEIGHT,
          paddingTop: MAX_OVERSCROLL_PLUS_LOGO_HEIGHT,
          // allow logo to be visible over header on home screen because it has a higher z-index, (and because of the overscroll hack):
          zIndex: -10,
          flexDirection: "row",
          paddingLeft: 12,
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          minHeight: 80,
          flexWrap: "wrap",
        }}
      >
        {!!onBack && (
          <BackButton cancelButton={backButtonCancelStyle} onPress={onBack} />
        )}
        <Pressable
          onLongPress={onLongPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 10,
          }}
        >
          {icon ? <Icon name={icon} color={colors.secondaryText} /> : null}
          <Title
            title={title}
            secondary
            style={{ marginVertical: 20, marginHorizontal: 10 }}
          />
        </Pressable>
        <Spacer />
        {isLoading && <Spinner style={{ marginHorizontal: 12 }} size="large" />}
        {corner}
      </View>
    </View>
  );
}
