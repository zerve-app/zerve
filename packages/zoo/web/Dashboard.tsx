import {
  ComponentProps,
  Context,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { View, ScrollView } from "react-native";
import { FragmentContext, useFragmentNavigationController } from "./Fragment";
import { FragmentLink } from "./FragmentLink";
import { NavLinkContent, NavLinkContentGroup } from "@zerve/zen/NavLink";
import { NavigationBarWidth, PaneWidth } from "@zerve/zen/FeaturePane";
import { useColors } from "@zerve/zen/useColors";
import { ButtonContent } from "@zerve/zen/Button";
import { Icon } from "@zerve/zen/Icon";
import { PageContainer } from "@zerve/zen/Page";
import { NavBar, NavBarZLogo } from "@zerve/zen/NavBar";
import { useWindowDimensions } from "@zerve/zen/useWindowDimensions";

export function NavSidebar({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode | null;
}) {
  const colors = useColors();
  return (
    <ScrollView
      style={{
        backgroundColor: colors.background,
        maxWidth: NavigationBarWidth,
        borderRightWidth: 1,
        borderColor: "#ccc",
        paddingTop: 80,
      }}
      contentContainerStyle={{
        minHeight: "100%",
      }}
    >
      <View style={{ flex: 1 }}>{children}</View>
      {footer}
    </ScrollView>
  );
}

export function NavFeatureLink<FeatureState>({
  title,
  icon,
  to,
  Context,
  inset,
  displayActive,
}: {
  title: string;
  icon?: ComponentProps<typeof Icon>["name"] | null;
  to: FeatureState;
  Context: Context<null | FragmentContext<FeatureState>>;
  inset?: boolean;
  displayActive?: boolean;
}) {
  const colors = useColors();
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");
  const isActive =
    displayActive ||
    fragmentContext.fragmentString === fragmentContext.stringifyFragment(to);
  const backgroundColor = isActive ? colors.activeTint : colors.background;

  return (
    <FragmentLink<FeatureState>
      to={to}
      Context={Context}
      backgroundColor={backgroundColor}
    >
      <NavLinkContent
        title={title}
        icon={icon}
        isActive={isActive}
        inset={inset}
      />
    </FragmentLink>
  );
}

export function NavLinkButton<FeatureState>({
  title,
  icon,
  to,
  Context,
}: {
  title: string;
  icon?: ComponentProps<typeof Icon>["name"] | null;
  to: FeatureState;
  Context: Context<null | FragmentContext<FeatureState>>;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render NavLinkButton outside of a FragmentContext");
  return (
    <FragmentLink<FeatureState> to={to} Context={Context}>
      <ButtonContent title={title} left={icon && <Icon name={icon} />} />
    </FragmentLink>
  );
}

function NavigationSidebar<FeatureState>({
  navigation,
  Context,
  getFeatureIcon,
  getFeatureTitle,
  footer,
  activeFeatures,
  activeDefaultFeatures,
}: {
  navigation: Array<FeatureState>;
  Context: Context<null | FragmentContext<FeatureState>>;
  getFeatureTitle: (feature: FeatureState) => string;
  getFeatureIcon: (
    feature: FeatureState,
  ) => ComponentProps<typeof Icon>["name"] | null;
  footer?: ReactNode;
  activeFeatures: Array<FeatureState>;
  activeDefaultFeatures?: FeatureState[] | null;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error(
      "Cannot render NavigationSidebar outside of a FragmentContext",
    );
  const topParent = activeFeatures[0];
  const topParentKey =
    topParent && fragmentContext.stringifyFragment(topParent);
  const activeDefaultFeatureKey =
    activeDefaultFeatures?.[0] &&
    fragmentContext.stringifyFragment(activeDefaultFeatures?.[0]);
  const displayNavItems: ReactNode[] = [];
  navigation.forEach((nav) => {
    const fragmentKey = fragmentContext.stringifyFragment(nav);
    displayNavItems.push(
      <NavFeatureLink
        Context={Context}
        to={nav}
        icon={getFeatureIcon(nav)}
        title={getFeatureTitle(nav)}
        key={fragmentKey}
        displayActive={
          fragmentContext.fragmentString === "" &&
          !!activeDefaultFeatureKey &&
          activeDefaultFeatureKey === fragmentKey
        }
      />,
    );
    if (topParentKey === fragmentKey) {
      activeFeatures.forEach((feature) => {
        const childFragmentKey = fragmentContext.stringifyFragment(feature);
        if (childFragmentKey === fragmentKey) return;
        displayNavItems.push(
          <NavFeatureLink
            inset
            Context={Context}
            key={childFragmentKey}
            to={feature}
            title={getFeatureTitle(feature)}
            icon={getFeatureIcon(feature)}
          />,
        );
      });
    }
  });
  return (
    <NavSidebar footer={footer}>
      <NavLinkContentGroup>{displayNavItems}</NavLinkContentGroup>
    </NavSidebar>
  );
}

export function DashboardPage<Feature>({
  Context,
  header,
  renderFeature,
  navigation,
  onIntercept,
  onFeature,
  getFeatureTitle,
  getFeatureIcon,
  getParentFeatures,
  stringifyFeatureFragment,
  parseFeatureFragment,
  navigationFooter,
  defaultFeature,
}: {
  Context: Context<null | FragmentContext<Feature>>;
  header?: ReactNode | null;
  renderFeature: (props: {
    feature: null | Feature;
    fragmentContext: FragmentContext<Feature>;
    isActive: boolean;
    key: string;
    title: string;
    icon: ComponentProps<typeof Icon>["name"] | null;
  }) => ReactNode;
  navigation: Array<Feature>;
  onIntercept?: (
    feature: Feature,
    navigateFeature: (feature: Feature) => void,
  ) => boolean;
  onFeature?: (feature: Feature | null, fragmentString: string) => void;
  getFeatureTitle: (feature: Feature) => string;
  navigationFooter?: ReactNode;
  getFeatureIcon: (
    feature: Feature,
  ) => ComponentProps<typeof Icon>["name"] | null;
  getParentFeatures?: (feature: Feature) => Array<Feature>;
  stringifyFeatureFragment: (feature: Feature) => string;
  parseFeatureFragment: (fragment: string) => Feature | null;
  defaultFeature?: Feature;
}) {
  const [feature, fragment, fragmentContext] =
    useFragmentNavigationController<Feature>(
      stringifyFeatureFragment,
      parseFeatureFragment,
      onFeature,
      onIntercept,
    );
  const [focusedFeature, setFocusedFeature] = useState<Feature | null>(feature);
  useEffect(() => {
    setFocusedFeature(feature);
  }, [feature]);
  const parentFeatures = useMemo(
    () => (getParentFeatures && feature ? getParentFeatures(feature) : []),
    [getParentFeatures, feature],
  );
  const { width } = useWindowDimensions();
  const wideEnoughForNavigation = width >= NavigationBarWidth + PaneWidth;
  const paneAvailableWidth = wideEnoughForNavigation
    ? width - NavigationBarWidth
    : width;
  const visiblePaneCount = Math.floor(paneAvailableWidth / PaneWidth);
  const displayNavSidebar = wideEnoughForNavigation || !feature;
  let activeFeatures: Feature[] = [...parentFeatures];
  if (feature) activeFeatures.push(feature);
  const activeDefaultFeatures =
    wideEnoughForNavigation && !!defaultFeature ? [defaultFeature] : [];
  const displayFeatures = activeFeatures.length
    ? activeFeatures.slice(-visiblePaneCount)
    : activeDefaultFeatures;
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        {header}
      </NavBar>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Context.Provider value={fragmentContext}>
          {displayNavSidebar ? (
            <NavigationSidebar
              Context={Context}
              navigation={navigation}
              getFeatureIcon={getFeatureIcon}
              getFeatureTitle={getFeatureTitle}
              footer={navigationFooter}
              activeDefaultFeatures={activeDefaultFeatures}
              activeFeatures={activeFeatures}
            />
          ) : null}
          <View
            style={{
              alignSelf: "stretch",
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {displayFeatures.length ? (
              <View
                style={{
                  flexDirection: "row",
                  borderLeftWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                {displayFeatures.map((displayFeature) => {
                  const key = fragmentContext.stringifyFragment(displayFeature);
                  return (
                    <DetectFocus
                      key={key}
                      onReportedFocus={() => {
                        setFocusedFeature(displayFeature);
                      }}
                    >
                      {renderFeature({
                        feature: displayFeature,
                        isActive: displayFeature === focusedFeature,
                        fragmentContext,
                        key,
                        title: getFeatureTitle(displayFeature),
                        icon: getFeatureIcon(displayFeature),
                      })}
                    </DetectFocus>
                  );
                })}
              </View>
            ) : null}
          </View>
        </Context.Provider>
      </View>
    </PageContainer>
  );
}

function DetectFocus({
  children,
  onReportedFocus,
}: {
  children: ReactNode;
  onReportedFocus: () => void;
}) {
  return (
    <span
      style={{
        display: "flex",
      }}
      onFocus={() => {
        onReportedFocus();
      }}
      onClickCapture={() => {
        onReportedFocus();
      }}
    >
      {children}
    </span>
  );
}
