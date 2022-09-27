import { ComponentProps, ReactNode } from "react";
import { View } from "react-native";
import { BackButton } from "../zoo/components/BackButton";
import { Pressable } from "react-native";
import { Icon } from "./Icon";
import { useColors } from "./useColors";
import { Title } from "./Text";
import { Spinner } from "./Spinner";

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
            flex: 1,
            marginHorizontal: 10,
          }}
        >
          {icon ? <Icon name={icon} color={colors.secondaryText} /> : null}
          <Title
            numberOfLines={1}
            title={title}
            secondary
            style={{ marginVertical: 20, marginHorizontal: 10, flex: 1 }}
          />
        </Pressable>
        {isLoading && <Spinner style={{ marginHorizontal: 12 }} size="small" />}
        {corner}
      </View>
    </View>
  );
}
