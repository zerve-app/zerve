import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { PlaygroundFeatures } from "@zerve/zen-playground/PlaygroundFeatures";
import { NavLink, NavLinkContentGroup } from "@zerve/zen/NavLink";
import { useNavigation } from "@react-navigation/native";
import {
  SettingsStackNavigationProps,
  SettingsStackScreenProps,
} from "../app/Links";
import NotFoundScreen from "./NotFoundScreen";

export type PlaygroundFeatureName = typeof PlaygroundFeatures[number]["name"];

export function ZenPlaygroundFeature() {
  const navigation =
    useNavigation<SettingsStackNavigationProps<"ZenPlayground">>();
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Zen UI Playground" />
      <NavLinkContentGroup>
        {Object.values(PlaygroundFeatures).map((feature, index) => {
          return (
            <NavLink
              key={index}
              icon={feature.icon}
              title={feature.title}
              onPress={() => {
                navigation.push("ZenPlayground", { feature: feature.name });
              }}
            />
          );
        })}
      </NavLinkContentGroup>
    </ScreenContainer>
  );
}

export default function ZenPlaygroundScreen({
  route,
}: SettingsStackScreenProps<"ZenPlayground">) {
  if (route.params.feature === null) return <ZenPlaygroundFeature />;
  const playground = PlaygroundFeatures.find(
    (f) => f.name === route.params.feature,
  );
  if (!playground) return <NotFoundScreen />;
  const Feature = playground.Feature;
  return <Feature />;
}
