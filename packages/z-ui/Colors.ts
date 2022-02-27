type Color = string;
type ColorTheme = {
  text: Color;
  lightText: Color;
  dangerText: Color;
  background: Color;
  backgroundDim: Color;
  tint: Color;
};

export default {
  light: {
    text: "#000",
    lightText: "#202020",
    dangerText: "#812313",
    background: "#fff",
    backgroundDim: "#fdfafd",
    tint: "#D2B4E4",
  } as ColorTheme,
  dark: {
    text: "#fff",
    lightText: "#dfdfdf",
    dangerText: "#F95A3E",
    background: "#19141c",
    backgroundDim: "#000",
    tint: "#47225E",
  } as ColorTheme,
};
