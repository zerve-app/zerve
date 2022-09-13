import { ColorValue } from "react-native";

export type ColorTheme = {
  text: ColorValue;
  secondaryText: ColorValue;
  changedTint: ColorValue;
  dangerText: ColorValue;
  background: ColorValue;
  backgroundDim: ColorValue;
  tintInverted: ColorValue;
  tint: ColorValue;
};

export default {
  light: {
    text: "#000000",
    secondaryText: "#505050",
    changedTint: "#ffd8b1",
    changed: "#db7107",
    dangerText: "#812313",
    background: "#ffffff",
    backgroundDim: "#fdfafd",
    tintInverted: "#D2B4E4",
    tint: "#9b65bc",
  } as ColorTheme,
  dark: {
    text: "#ffffff",
    secondaryText: "#dfdfdf",
    changedTint: "#db7107",
    changed: "#ffd8b1",
    dangerText: "#F95A3E",
    background: "#19141c",
    backgroundDim: "#000000",
    tintInverted: "#9b65bc",
    tint: "#D2B4E4",
  } as ColorTheme,
} as const;
