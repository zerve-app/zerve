type Color = string;
type ColorTheme = {
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
    text: "#000",
    secondaryText: "#505050",
    dangerText: "#812313",
    background: "#fff",
    backgroundDim: "#fdfafd",
    tintInverted: "#D2B4E4",
    tint: "#47225E",
  } as ColorTheme,
  dark: {
    text: "#fff",
    secondaryText: "#dfdfdf",
    dangerText: "#F95A3E",
    background: "#19141c",
    backgroundDim: "#000",
    tintInverted: "#47225E",
    tint: "#D2B4E4",
  } as ColorTheme,
};
