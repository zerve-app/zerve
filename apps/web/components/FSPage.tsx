import { View } from "react-native";

export default function FSPage({ pathTerms }: { pathTerms: string[] }) {
  return (
    <View style={{ flex: 1, backgroundColor: "blue" }}>
      <h1>fs: {pathTerms.join("/")} </h1>
    </View>
  );
}
