import { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "./Icon";
import { useColors } from "./useColors";

export function NavLinkContentGroup({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <View
      style={{
        marginVertical: 12,
        borderTopWidth: 1,
        backgroundColor: colors.background,
        borderColor: `${colors.secondaryText}33`,
      }}
    >
      {children}
    </View>
  );
}

type NavLinkContentProps = {
  title: string;
  icon?: ComponentProps<typeof Icon>["name"] | null;
  inset?: boolean;
  isActive?: boolean;
};

export function NavLinkContent({
  title,
  icon,
  inset,
  isActive,
}: NavLinkContentProps) {
  const colors = useColors();
  return (
    <View
      style={{
        // backgroundColor: colors.background,
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        ...(inset ? { paddingLeft: 36 } : {}),
        borderBottomWidth: 1,
        borderBottomColor: `${colors.secondaryText}33`,
        alignItems: "center",
      }}
    >
      {icon && (
        <View
          style={{
            height: 24,
            width: 24,
            alignItems: "center",
          }}
        >
          <Icon name={icon} color="#464646" size={24} />
        </View>
      )}
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          marginHorizontal: 16,
          textDecorationLine: "none",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export function NavLink({
  onPress,
  ...props
}: { onPress: () => void } & NavLinkContentProps) {
  return (
    <Pressable onPress={onPress}>
      <NavLinkContent {...props} />
    </Pressable>
  );
}
