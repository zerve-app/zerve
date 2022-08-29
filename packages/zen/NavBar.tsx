import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "./Link";
import { ScrollView } from "react-native-gesture-handler";
import { Spinner } from "./Spinner";
import { useRouter } from "next/router";

function NavBarRoutingIndicator() {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);
  const timeout = useRef<null | number>(null);
  useEffect(() => {
    const handleStart = (url: string) => {
      timeout.current = setTimeout(() => {
        setIsRouting(true);
      }, 350);
    };
    const handleStop = () => {
      clearTimeout(timeout.current);
      setIsRouting(false);
    };
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
      pointerEvents="none"
    >
      {isRouting ? <Spinner size="large" /> : null}
    </View>
  );
}

export function NavBar({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexDirection: "row",
        height: 60,
        flex: 1,
        alignItems: "center",
      }}
      style={{ backgroundColor: "#ececec", maxHeight: 60 }}
    >
      {children}
      <NavBarRoutingIndicator />
    </ScrollView>
  );
}

export function NavBarSpacer() {
  return <View style={{ flex: 1 }} />;
}

export function NavBarZLogo() {
  return (
    <Link href="/">
      <View style={{ height: 60, width: 60, backgroundColor: "green" }}>
        <LinearGradient
          colors={["#6144b8", "#9f4ab5"]}
          start={{ x: 0.5, y: 0.0 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          fill="none"
          viewBox="0 0 409 409"
          style={{
            width: 36,
            height: 36,
            margin: 12,
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
