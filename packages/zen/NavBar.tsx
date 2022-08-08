import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ReactNode } from "react";
import { Link } from "./Link";

export function NavBar({ children }: { children: ReactNode }) {
  return (
    <View
      style={{ backgroundColor: "#decdec", height: 50, flexDirection: "row" }}
    >
      {children}
    </View>
  );
}

export function NavBarSpacer() {
  return <View style={{ flex: 1 }} />;
}

export function NavBarZLogo() {
  return (
    <Link href="/">
      <View style={{ height: 50, width: 50, backgroundColor: "green" }}>
        <LinearGradient
          colors={["#6144b8", "#9f4ab5"]}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          fill="none"
          viewBox="0 0 409 409"
          style={{
            width: 30,
            height: 30,
            margin: 10,
            position: "absolute",
          }}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m408.277 0-68.64 105.697H0v-.145L68.546 0h339.731ZM310.47 151.652l-68.64 105.697H115.8l68.641-105.697H310.47ZM408.515 303.305l-68.64 105.697H16.582l68.64-105.697h323.293Z"
            fill="#fff"
          />
        </Svg>
      </View>
    </Link>
  );
}
