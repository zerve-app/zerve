type Color = string;
export type ColorTheme = {
  text: Color;
  secondaryText: Color;
  dangerText: Color;
  background: Color;
  backgroundDim: Color;
  tintInverted: Color;
  tint: Color;
};

export default {
  light: {
    text: "#000000",
    secondaryText: "#505050",
    dangerText: "#812313",
    background: "#ffffff",
    backgroundDim: "#fdfafd",
    tintInverted: "#D2B4E4",
    tint: "#9b65bc",
  } as ColorTheme,
  dark: {
    text: "#ffffff",
    secondaryText: "#dfdfdf",
    dangerText: "#F95A3E",
    background: "#19141c",
    backgroundDim: "#000000",
    tintInverted: "#9b65bc",
    tint: "#D2B4E4",
  } as ColorTheme,
};
