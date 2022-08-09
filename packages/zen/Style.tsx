import { Platform } from "react-native";

export const smallShadow = {
  ...Platform.select({
    android: {
      elevation: 3,
    },
    default: {
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowColor: "#111", // you should usually override with your text color so it looks as good on inverted color mode
    },
  }),
} as const;

export const bigShadow = {
  ...Platform.select({
    android: {
      elevation: 6,
      // shadowRadius: 6,
      // shadowOffset: { width: 0, height: 4 },
      // shadowOpacity: 0.25,
      // shadowColor: "#111",
    },
    default: {
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowColor: "#111", // you should usually override with your text color so it looks as good on inverted color mode
    },
  }),
} as const;

export const AbsoluteFill = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
} as const;
