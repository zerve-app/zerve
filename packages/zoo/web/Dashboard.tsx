import { ComponentProps, Context, ReactNode, useContext, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  Button,
  Icon,
  NavBar,
  NavBarZLogo,
  PageContainer,
  useColors,
  useWindowDimensions,
} from "@zerve/zen";
import { FragmentContext, useFragmentNavigationController } from "./Fragment";
import { NavigationBarWidth, PaneWidth } from "../components/FeaturePane";
import { FragmentLink } from "./FragmentLink";
import { NavLinkContent } from "@zerve/zen/NavLink";

export function NavSidebar({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode | null;
}) {
  return (
    <ScrollView
      style={{
        backgroundColor: "#f9d9fb",
        maxWidth: NavigationBarWidth,
        borderRightWidth: 1,
        borderColor: "#ccc",
        paddingTop: 80,
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
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render NavLink outside of a FragmentContext");
  const isActive =
    displayActive ||
    fragmentContext.fragmentString === fragmentContext.stringifyFragment(to);
  return (
    <FragmentLink<FeatureState> to={to} Context={Context}>
      <Pressable
        onPress={() => {
          fragmentContext.navigateFragment(to);
        }}
      >
        <NavLinkContent
          title={title}
          icon={icon}
          isActive={isActive}
          inset={inset}
        />
      </Pressable>
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
      <Button
        onPress={() => {
          // this should not be reached. FragmentLink should stopPropagation() the event before it hits the button because it uses onClickCapture
          // but just in case:
          fragmentContext.navigateFragment(to);
        }}
        title={title}
        left={icon && <Icon name={icon} />}
      />
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
  defaultFeature,
}: {
  navigation: Array<FeatureState>;
  Context: Context<null | FragmentContext<FeatureState>>;
  getFeatureTitle: (feature: FeatureState) => string;
  getFeatureIcon: (
    feature: FeatureState,
  ) => ComponentProps<typeof Icon>["name"] | null;
  footer?: ReactNode;
  activeFeatures: Array<FeatureState>;
  defaultFeature?: FeatureState;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error(
      "Cannot render NavigationSidebar outside of a FragmentContext",
    );
  const topParent = activeFeatures[0];
  const topParentKey =
    topParent && fragmentContext.stringifyFragment(topParent);
  const defaultFeatureKey =
    defaultFeature && fragmentContext.stringifyFragment(defaultFeature);
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
          !!defaultFeatureKey &&
          defaultFeatureKey === fragmentKey
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
  return <NavSidebar footer={footer}>{displayNavItems}</NavSidebar>;
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
  const displayFeatures =
    activeFeatures.length || !defaultFeature
      ? activeFeatures.slice(-visiblePaneCount)
      : [defaultFeature];
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
              defaultFeature={defaultFeature}
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
            <View
              style={{
                flexDirection: "row",
                borderLeftWidth: 1,
                borderColor: "#ccc",
              }}
            >
              {displayFeatures.map((displayFeature) =>
                renderFeature({
                  feature: displayFeature,
                  isActive: displayFeature === feature,
                  fragmentContext,
                  key: fragmentContext.stringifyFragment(displayFeature),
                  title: getFeatureTitle(displayFeature),
                  icon: getFeatureIcon(displayFeature),
                }),
              )}
            </View>
          </View>
        </Context.Provider>
      </View>
    </PageContainer>
  );
}
