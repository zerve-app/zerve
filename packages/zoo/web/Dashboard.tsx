import React, {
  ComponentProps,
  Context,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  ActionButtonDef,
  Button,
  Icon,
  IconButton,
  NavBar,
  NavBarSpacer,
  NavBarZLogo,
  PageContainer,
  Spinner,
  useActionsSheet,
  useWindowDimensions,
} from "@zerve/zen";
import { AuthHeader } from "../components/AuthHeader";
import {
  FragmentContext,
  FragmentLink,
  useFragmentNavigationController,
} from "./Fragment";
import { NavigationBarWidth, PaneWidth } from "./DashboardConstants";

export function NavSidebar({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode | null;
}) {
  return (
    <View
      style={{
        backgroundColor: "#f9d9fb",
        width: NavigationBarWidth,
        borderRightWidth: 1,
        borderColor: "#ccc",
        paddingTop: 80,
      }}
    >
      <View style={{ flex: 1 }}>{children}</View>
      {footer}
    </View>
  );
}

export function NavLinkContent({
  title,
  icon,
  inset,
  isActive,
}: {
  title: string;
  icon?: ComponentProps<typeof FontAwesome>["name"] | null;
  inset?: boolean;
  isActive?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        backgroundColor: isActive ? "#FFC8FC" : "transparent",
        ...(inset ? { paddingLeft: 36 } : {}),
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
  );
}

export function NavLink<FeatureState>({
  title,
  icon,
  to,
  Context,
  inset,
  displayActive,
}: {
  title: string;
  icon?: ComponentProps<typeof FontAwesome>["name"] | null;
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
  icon?: ComponentProps<typeof FontAwesome>["name"] | null;
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

export function FeaturePane({
  title,
  children,
  spinner,
  actions,
}: {
  title: string;
  children: ReactNode;
  spinner?: boolean;
  actions?: ActionButtonDef[];
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
    <View
      style={{
        borderRightWidth: 1,
        borderColor: "#00000033",
        width: PaneWidth,
      }}
    >
      <View style={{ minHeight: 80 }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{ fontSize: 28, color: "#464646", flex: 1, padding: 16 }}
          >
            {title}
          </Text>
          {actions ? actionButton : null}
        </View>
        {spinner && (
          <Spinner style={{ position: "absolute", right: 10, bottom: 10 }} />
        )}
      </View>
      <View style={{ backgroundColor: "#fafafa", flex: 1 }}>{children}</View>
    </View>
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
  ) => ComponentProps<typeof FontAwesome>["name"] | null;
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
      <NavLink
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
          <NavLink
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
    icon: ComponentProps<typeof FontAwesome>["name"] | null;
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
  ) => ComponentProps<typeof FontAwesome>["name"] | null;
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
