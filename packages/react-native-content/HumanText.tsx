import React, { createContext, useContext } from "react";
import { Linking, Platform, Text, TextStyle } from "react-native";
import { HumanText } from "./Schema";

export type HumanTextNode = HumanText[number];
export type LinkPressHandler = (href: string, textNode: HumanTextNode) => void;
export type HumanTextOptions = {
  style?: TextStyle;
  codeStyle?: TextStyle;
  linkStyle?: TextStyle;
  linkWebTarget?: "_blank" | "" | null;
  linkPressOverride?: LinkPressHandler;
};

const IS_WEB = Platform.OS === "web";
const DefaultCodeStyle: TextStyle = {
  backgroundColor: "#00000011",
  fontFamily: "monospace",
  padding: 2,
  borderRadius: 2,
} as const;
const DefaultLinkStyle: TextStyle = {
  textDecorationLine: "underline",
  color: "#687ab7",
} as const;
const defaultHandleTextLink: LinkPressHandler = (href: string) => {
  Linking.openURL(href);
};
const WebAStyleReset = IS_WEB
  ? {
      textDecoration: "none",
    }
  : undefined;

export const HumanTextContext = createContext<HumanTextOptions>({});

export function HumanText({
  value,
  options,
  style,
}: {
  value: HumanText;
  options?: HumanTextOptions;
  style?: TextStyle;
}) {
  const contextualOptions = useContext(HumanTextContext);
  return (
    <Text style={style}>
      {value.map((t) => {
        const textStyle: TextStyle = {
          textDecorationLine: t.underline
            ? t.strike
              ? "underline line-through"
              : "underline"
            : t.strike
            ? "line-through"
            : undefined,
        };
        if (t.bold) textStyle.fontWeight = "bold";
        if (t.italic) textStyle.fontStyle = "italic";
        let codeTextStyle: TextStyle | undefined = undefined;
        if (t.code) {
          codeTextStyle =
            options?.codeStyle ||
            contextualOptions?.codeStyle ||
            DefaultCodeStyle;
        }
        let linkTextStyle: TextStyle | undefined = undefined;
        if (typeof t.linkHref === "string") {
          linkTextStyle =
            options?.linkStyle ||
            contextualOptions?.linkStyle ||
            DefaultLinkStyle;
        }
        const linkPressOverride: undefined | LinkPressHandler =
          options?.linkPressOverride || contextualOptions?.linkPressOverride;
        const { linkHref } = t;
        const textNode = (
          <Text
            style={[textStyle, codeTextStyle, linkTextStyle]}
            onPress={
              typeof linkHref === "string" && (!!linkPressOverride || !IS_WEB)
                ? () => {
                    (linkPressOverride || defaultHandleTextLink)(linkHref, t);
                  }
                : undefined
            }
          >
            {t.text}
          </Text>
        );
        if (typeof t.linkHref === "string" && IS_WEB && !linkPressOverride) {
          const linkWebTarget =
            typeof options?.linkWebTarget === "string"
              ? options?.linkWebTarget
              : typeof contextualOptions.linkWebTarget === "string"
              ? contextualOptions.linkWebTarget
              : "_blank";
          return (
            <a
              href={t.linkHref}
              style={WebAStyleReset}
              target={linkWebTarget}
              onClick={(e) => {
                if (linkPressOverride) {
                  e.preventDefault();
                }
              }}
            >
              {textNode}
            </a>
          );
        }
        return textNode;
      })}
    </Text>
  );
}
