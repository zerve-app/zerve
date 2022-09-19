import { ColorValue } from "react-native";
import Color from "color";

export function multiplyColors(a: ColorValue, b: ColorValue) {
  const aColor = Color(a).rgb().array();
  const bColor = Color(b).rgb().array();
  const added = Color.rgb(
    aColor.map((aValue, idx) => {
      const bValue = bColor[idx];
      return Math.max(
        0,
        Math.min(255, Math.round((aValue / 255) * (bValue / 255) * 255)),
      );
    }),
  );
  return added.hex();
}
