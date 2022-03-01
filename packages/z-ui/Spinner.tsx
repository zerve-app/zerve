import { ActivityIndicator } from "react-native";
import { useColors } from "./useColorScheme";

export function Spinner() {
  const colors = useColors();
  return <ActivityIndicator size="small" color={colors.text} />;
}
