export const smallShadow = {
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowColor: "#111", // you should usually override with your text color so it looks as good on inverted color mode
} as const;

export const bigShadow = {
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowColor: "#111", // you should usually override with your text color so it looks as good on inverted color mode
} as const;
