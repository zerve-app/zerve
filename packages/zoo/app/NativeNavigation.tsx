import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/SettingsScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import {
  HomeStackParamList,
  RootStackParamList,
  RootStackScreenProps,
  SettingsStackParamList,
} from "./Links";
import HomeScreen from "../screens/HomeScreen";
import KitchenSinkScreen from "../screens/KitchenSinkScreen";
import NewConnectionScreen from "../screens/NewConnectionScreen";
import ConnectionInfoScreen from "../screens/ConnectionInfoScreen";
import ZNodeScreen from "../screens/ZNodeScreen";
import ConnectionsScreen from "../screens/ConnectionsScreen";
import ErrorScreen from "../screens/ErrorScreen";
import RawValueScreen from "../screens/RawValueScreen";
import JSONInputScreen from "../screens/JSONInputScreen";
import TestSortScreen from "../screens/TestSortScreen";
import TestJSONInputScreen from "../screens/TestJSONInputScreen";
import TestUIScreen from "../screens/TestUIScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ConnectionScreen from "../screens/ConnectionScreen";
import TestHistoryScreen from "../screens/TestHistoryScreen";
import HistoryEventScreen from "../screens/HistoryEventScreen";
import { LogBox, Platform } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import StoreFeatureScreen from "../screens/StoreFeatureScreen";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import AuthInScreen from "../screens/AuthInScreen";
import { AppLocation, AppLocationProvider } from "./Location";
import { UnsavedContext, useUnsaved } from "./Unsaved";
import { initFocusManager } from "./FocusManager";

initFocusManager();

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "new Gestures system!",
]);

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="Connection"
        component={ConnectionScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ZNode"
        component={ZNodeScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="History"
        component={HistoryScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="HistoryEvent"
        component={HistoryEventScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="StoreFeature"
        component={StoreFeatureScreen}
        options={DefaultScreenOptions}
      />
    </HomeStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const DefaultScreenOptions = {
  headerShown: false,
  fullScreenGestureEnabled: true,
} as const;
const ModalScreenOptions = {
  presentation: "modal",
  statusBarStyle: "light",
  statusBarAnimation: "fade",
} as const;

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="KitchenSink"
        component={KitchenSinkScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestSort"
        component={TestSortScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestUI"
        component={TestUIScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestHistory"
        component={TestHistoryScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestJSONInput"
        component={TestJSONInputScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="NewConnection"
        component={NewConnectionScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="ConnectionInfo"
        component={ConnectionInfoScreen}
        options={DefaultScreenOptions}
      />
    </SettingsStack.Navigator>
  );
}

const RootStack = createNativeStackNavigator<RootStackParamList>();

function ModalInsetsContext({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaInsetsContext.Provider
      value={{
        ...insets,
        top: Platform.select({ ios: 0, default: insets.top }),
      }}
    >
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

function rootStackModalContextScreen<
  ScreenKey extends keyof RootStackParamList,
>(Component: FC<RootStackScreenProps<ScreenKey>>) {
  return (props: RootStackScreenProps<ScreenKey>) => (
    <ModalInsetsContext>
      <Component {...props} />
    </ModalInsetsContext>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="HomeStack"
        component={HomeNavigator}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="Error"
        component={ErrorScreen}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="AuthIn"
        component={rootStackModalContextScreen<"AuthIn">(AuthInScreen)}
        options={{
          ...DefaultScreenOptions,
          ...ModalScreenOptions,
        }}
      />
      <RootStack.Screen
        name="JSONInput"
        component={rootStackModalContextScreen<"JSONInput">(JSONInputScreen)}
        options={{
          ...DefaultScreenOptions,
          ...ModalScreenOptions,
        }}
      />
      <RootStack.Screen
        name="SettingsStack"
        component={rootStackModalContextScreen<"SettingsStack">(
          SettingsNavigator,
        )}
        options={{
          ...DefaultScreenOptions,
          ...ModalScreenOptions,
        }}
      />
      <RootStack.Screen
        name="RawValue"
        component={rootStackModalContextScreen<"RawValue">(RawValueScreen)}
        options={{
          ...DefaultScreenOptions,
          ...ModalScreenOptions,
        }}
      />
    </RootStack.Navigator>
  );
}

function getActiveRoute(state) {
  const route = state.routes[state.index];
  if (route.state) return getActiveRoute(route.state);
  return route;
}

export function ZooAppNavigation() {
  const unsaved = useUnsaved();
  const navContainer =
    useRef<null | NavigationContainerRef<RootStackParamList>>(null);
  const [location, setLocation] = useState<null | AppLocation>(null);
  useEffect(() => {
    if (!navContainer.current)
      throw new Error("could not access ref of NavigationContainer");
    function handleState(e) {
      const route = getActiveRoute(e.data.state);
      if (route.name === "StoreFeature") {
        setLocation({
          connection: route.params.connection,
          path: route.params.storePath,
          storeFeature: route.params.feature,
        });
      } else {
        setLocation(null);
      }
    }
    navContainer.current.addListener("state", handleState);
    return () => {
      navContainer.current?.removeListener("state", handleState);
    };
  }, []);
  return (
    <NavigationContainer ref={navContainer}>
      <AppLocationProvider location={location}>
        <UnsavedContext.Provider value={unsaved}>
          <RootNavigator />
        </UnsavedContext.Provider>
      </AppLocationProvider>
    </NavigationContainer>
  );
}
