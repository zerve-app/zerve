import { Text, View } from "react-native";
import { Button } from "ui";

export default function Web() {
  return (
    <View style={{ backgroundColor: "lightblue", flex: 1 }}>
      <Text>Agent</Text>

      <Text style={{}} accessibilityRole="link" href={`/display`}>
        Display
      </Text>

      <Text style={{}} accessibilityRole="link" href={`/control`}>
        Control Panel
      </Text>
    </View>
  );
}
