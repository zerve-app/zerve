import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ButtonProps = { title: string; onPress: () => void };

export function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: "#222",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 14,
        }}
      >
        <Text style={{ color: "white" }}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
