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
import EntryScreen from "../screens/EntryScreen";
import KitchenSinkScreen from "../screens/KitchenSinkScreen";
import NewConnectionScreen from "../screens/NewConnectionScreen";
import ConnectionInfoScreen from "../screens/ConnectionInfoScreen";
import NewFileScreen from "../screens/NewFileScreen";
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
import { TestHistoryScreen } from "../screens/TestHistoryScreen";
import FileSchemaScreen from "../screens/FileSchemaScreen";
import StoreHistoryScreen from "../screens/StoreHistoryScreen";
import StoreSchemasScreen from "../screens/StoreSchemasScreen";
import HistoryEventScreen from "../screens/HistoryEventScreen";
import StoreSchemaScreen from "../screens/StoreSchemaScreen";
import { LogBox, Platform } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FC, ReactNode, useMemo, useRef, useState } from "react";
import { UnsavedContext } from "../context/StoreDashboardContext";
import StoreFeatureScreen from "../screens/StoreFeatureScreen";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";

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
        name="NewFile"
        component={NewFileScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="Entry"
        component={EntryScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="StoreHistory"
        component={StoreHistoryScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="StoreSchemas"
        component={StoreSchemasScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="StoreSchema"
        component={StoreSchemaScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="FileSchema"
        component={FileSchemaScreen}
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

export function ZooAppNavigation() {
  const dirtyIdRef = useRef<null | string>(null);
  const dirtyValue = useRef<null | any>(null);
  const [dirtyId, setDirtyId] = useState<null | string>(null);
  const unsavedCtx = useMemo(() => {
    return {
      releaseDirty: (id: string) => {
        console.log("RELEASEDIRTY", id);
        dirtyValue.current = null;
        dirtyIdRef.current = null;
        setDirtyId(null);
      },
      claimDirty: (id: string, value: any) => {
        console.log("CLAIMDIRTY", id, value);
        dirtyValue.current = value;
        dirtyIdRef.current = id;
        if (dirtyId !== id) {
          setDirtyId(id);
        }
      },
      getDirtyValue: (id: string) => {
        if (id === dirtyIdRef.current) return dirtyValue.current;
        return undefined;
      },
      dirtyId,
    };
  }, [dirtyId]);
  const navContainer =
    useRef<null | NavigationContainerRef<RootStackParamList>>(null);
  // navContainer.current?.addListener('state')
  return (
    <NavigationContainer ref={navContainer}>
      <UnsavedContext.Provider value={unsavedCtx}>
        <RootNavigator />
      </UnsavedContext.Provider>
    </NavigationContainer>
  );
}
