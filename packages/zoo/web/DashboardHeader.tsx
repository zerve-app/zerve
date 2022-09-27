import { ComponentProps } from "react";
import { Text, View } from "react-native";

import Svg, { SvgProps, Path } from "react-native-svg";
import { Icon } from "@zerve/zen/Icon";
import { Link } from "@zerve/zen/Link";
import { getUserDisplayName } from "../components/Auth";

function DashboardHeaderItem({
  label,
  color,
  href,
  icon,
  zIndex,
}: {
  label: string;
  color: string;
  href: string;
  icon: ComponentProps<typeof Icon>["name"];
  zIndex: number; //nooooooooo
}) {
  return (
    <Link href={href}>
      <View
        style={{
          backgroundColor: color,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 28,
          paddingRight: 10,
          minHeight: 60,
          zIndex,
        }}
      >
        <Icon name={icon} color="white" />
        <Text
          style={{
            color: "white",
            marginLeft: 12,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {label}
        </Text>
        <Svg
          width={22}
          height={60}
          fill="none"
          style={{ position: "absolute", right: -16, zIndex: zIndex + 1 }}
        >
          <Path d="M5.537 0H0v60h5.537L22 30 5.538 0Z" fill={color} />
        </Svg>
      </View>
    </Link>
  );
}

export function ProjectHeader({
  label,
  href,
}: {
  href: string;
  label: string;
}) {
  return (
    <DashboardHeaderItem
      label={label}
      color={"#ad47b1"}
      href={href}
      icon="briefcase"
      zIndex={0}
    />
  );
}

export function OrgHeader({ orgId }: { orgId: string }) {
  return (
    <DashboardHeaderItem
      label={orgId}
      color={"#6942BF"}
      href={`/${orgId}`}
      icon="building"
      zIndex={10}
    />
  );
}

export function UserHeader({ userId }: { userId: string }) {
  return (
    <DashboardHeaderItem
      label={getUserDisplayName(userId)}
      color={"#4A4EB1"}
      href={`/${userId}`}
      icon="user"
      zIndex={10}
    />
  );
}
