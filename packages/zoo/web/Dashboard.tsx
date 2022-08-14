import React, {
  ComponentProps,
  Context,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  Link,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  useWindowDimensions,
} from "@zerve/zen";
import { AuthHeader } from "../components/AuthHeader";
import {
  FragmentContext,
  FragmentLink,
  useFragmentNavigationController,
} from "./Fragment";
import { useSafeArea } from "../provider/SafeArea/useSafeArea";

export function ProjectHeader({ name }: { name: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ad47b1",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <FontAwesome name="briefcase" color={"white"} size={18} />
      <Text
        style={{
          color: "white",
          marginLeft: 12,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

export function OrgHeader({ name }: { name: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ad47b1",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <FontAwesome name="building" color={"white"} size={18} />
      <Text
        style={{
          color: "white",
          marginLeft: 12,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

export function NavSidebar({ children }: { children: ReactNode }) {
  return (
    <View style={{ backgroundColor: "#f9d9fb", width: 300 }}>{children}</View>
  );
}

export function NavLink<FeatureState>({
  title,
  icon,
  to,
  Context,
}: {
  title: string;
  icon?: ComponentProps<typeof FontAwesome>["name"];
  to: FeatureState;
  Context: Context<null | FragmentContext<FeatureState>>;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");

  const isActive = false;
  return (
    <FragmentLink<FeatureState> to={to} Context={Context}>
      <View
        style={{
          padding: 10,
          paddingHorizontal: 12,
          flexDirection: "row",
          backgroundColor: isActive ? "#FFC8FC" : "transparent",
        }}
      >
        {icon && (
          <FontAwesome name={icon} color="#464646" style={{ marginTop: 2 }} />
        )}
        <Text
          style={{
            color: "#464646",
            fontWeight: "bold",
            fontSize: 14,
            marginLeft: 12,
            textDecorationLine: "none",
          }}
        >
          {title}
        </Text>
      </View>
    </FragmentLink>
  );
}

export function FeaturePane({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{ borderRightWidth: 1, borderColor: "#00000033", width: 300 }}>
      <View style={{ minHeight: 80, padding: 16 }}>
        <Text style={{ fontSize: 28, color: "#464646" }}>{title}</Text>
      </View>
      <View style={{ backgroundColor: "#fafafa", flex: 1 }}>{children}</View>
    </View>
  );
}

type NavLinkSpec<FeatureState> = {
  title: string;
  state: FeatureState;
};

function NavigationSidebar<FeatureState>({
  navigation,
  Context,
}: {
  navigation: Array<NavLinkSpec<FeatureState>>;
  Context: Context<null | FragmentContext<FeatureState>>;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error(
      "Cannot render NavigationSidebar outside of a FragmentContext"
    );
  return (
    <NavSidebar>
      {navigation.map((nav) => (
        <NavLink
          Context={Context}
          title={nav.title}
          to={nav.state}
          key={fragmentContext.stringifyFragment(nav.state)}
        />
      ))}
    </NavSidebar>
  );
}

export function DashboardPage<Feature>({
  Context,
  renderFeature,
  navigation,
  getParentFeatures,
  stringifyFeatureFragment,
  parseFeatureFragment,
}: {
  Context: Context<null | FragmentContext<Feature>>;
  renderFeature: (props: {
    feature: null | Feature;
    fragmentContext: FragmentContext<Feature>;
    isActive: boolean;
    key: string;
  }) => ReactNode;
  navigation: Array<NavLinkSpec<Feature>>;
  getParentFeatures?: (navState: Feature) => Array<Feature>;
  stringifyFeatureFragment: (feature: Feature) => string;
  parseFeatureFragment: (fragment: string) => Feature | null;
}) {
  const [feature, fragment, fragmentContext] =
    useFragmentNavigationController<Feature>(
      stringifyFeatureFragment,
      parseFeatureFragment
    );
  const parentFeatures = useMemo(
    () => (getParentFeatures && feature ? getParentFeatures(feature) : []),
    [getParentFeatures, feature]
  );
  const { width } = useWindowDimensions();
  const wideEnoughForNavigation = width >= 700;
  const displayNavSidebar = wideEnoughForNavigation || !feature;
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <NavBarSpacer />
        <AuthHeader />
      </NavBar>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Context.Provider value={fragmentContext}>
          {displayNavSidebar ? (
            <NavigationSidebar Context={Context} navigation={navigation} />
          ) : null}
          {parentFeatures.map((feature) =>
            renderFeature({
              feature,
              isActive: false,
              fragmentContext,
              key: fragmentContext.stringifyFragment(feature),
            })
          )}
          {feature &&
            renderFeature({
              feature,
              isActive: true,
              fragmentContext,
              key: fragmentContext.stringifyFragment(feature),
            })}
        </Context.Provider>
      </View>
    </PageContainer>
  );
}
