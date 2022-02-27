const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

type Color = string;
type ColorTheme = {
  text: Color;
  lightText: Color;
  background: Color;
  backgroundDim: Color;
  tint: Color;
};

export default {
  light: {
    text: "#000",
    lightText: "#202020",
    background: "#fff",
    backgroundDim: "#ececec",
    tint: tintColorLight,
  } as ColorTheme,
  dark: {
    text: "#fff",
    lightText: "#dfdfdf",
    background: "#000",
    backgroundDim: "#101a1c",
    tint: tintColorDark,
  } as ColorTheme,
};
