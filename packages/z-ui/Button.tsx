import { Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "./useColorScheme";
import { ThemedText } from "./Themed";

type ButtonProps = { title: string; onPress: () => void };

export function Button({ title, onPress }: ButtonProps) {
  const theme = useColorScheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          borderWidth: 1,
          borderColor: theme === "light" ? "#111" : "#ddd",
          borderRadius: 5,
          padding: 14,
        }}
      >
        <ThemedText style={{}}>{title}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}
