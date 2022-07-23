import { RootNavigator } from "@zerve/zoo/app/NativeNavigation";
import { Provider } from "@zerve/zoo/provider";
import { useFonts } from "expo-font";

export default function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/ttf/Inter.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider>
      <RootNavigator />
    </Provider>
  );
}
