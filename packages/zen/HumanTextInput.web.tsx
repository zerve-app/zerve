import { FieldComponentProps, FromSchema, HumanTextSchema } from "@zerve/zed";
import { useEditor, EditorContent } from "@tiptap/react";
import { View } from "react-native";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Link from "@tiptap/extension-link";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import { useAllColors, useColors } from "./useColors";
import Layout from "./Layout";
import { useEffect, useRef, useState } from "react";
import { useTextInputFormModal } from "./TextInputFormModal";
import { ThemedText } from "./Themed";

export function HumanTextInput(
  props: FieldComponentProps<typeof HumanTextSchema>,
) {
  const [isFocused, setIsFocused] = useState(false);
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: props.value,
    editable: !!props?.onValue,
    onUpdate: ({ editor }) => {
      const editorJSON = editor.getJSON();
      props?.onValue(editorJSON);
    },
  });
  useEffect(() => {
    if (!editor) return;
    const value = props.value;
    const editorValue = editor.getJSON();
    // this is so embarassing. enough consoling log, please console.Eric for this travesty
    if (JSON.stringify(value) !== JSON.stringify(editorValue)) {
      editor.commands.setContent(value);
    }
  }, [props.value]);
  const colors = useAllColors();
  const editHref = useTextInputFormModal<string>((defaultValue: string) => ({
    defaultValue,
    title: "Link to:",
    onValue: (href) => {
      editor?.chain().focus().setLink({ href }).run();
    },
    inputLabel: "URL",
  }));
  const linkNodeHref = editor?.getAttributes("link")?.href;

  return (
    <View
      style={{
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: Layout.borderRadius,
      }}
    >
      <View
        style={{
          backgroundColor: colors.active.background,
        }}
      >
        <EditorContent
          style={{ overflow: "hidden" }}
          editor={editor}
          onBlur={() =>
            setTimeout(() => {
              setIsFocused(false);
            }, 500)
          }
          onFocus={() => setIsFocused(true)}
          className="HumanTextEditorContent"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#eee",
          paddingHorizontal: 4,
          paddingVertical: 2,
          height: 36,
        }}
      >
        <IconButton
          altTitle="Bold"
          size="sm"
          onPress={() => {
            editor?.chain().focus().toggleBold().run();
          }}
          icon={({ size }) => (
            <Icon
              name="bold"
              size={size}
              color={
                isFocused && editor?.isActive("bold")
                  ? colors.active.tint
                  : colors.active.secondaryText
              }
            />
          )}
        />
        <IconButton
          altTitle="Italic"
          size="sm"
          onPress={() => {
            editor?.chain().focus().toggleItalic().run();
          }}
          icon={({ size }) => (
            <Icon
              name="italic"
              size={size}
              color={
                isFocused && editor?.isActive("italic")
                  ? colors.active.tint
                  : colors.active.secondaryText
              }
            />
          )}
        />
        <IconButton
          altTitle="Underline"
          size="sm"
          onPress={() => {
            editor?.chain().focus().toggleUnderline().run();
          }}
          icon={({ size }) => (
            <Icon
              name="underline"
              size={size}
              color={
                isFocused && editor?.isActive("underline")
                  ? colors.active.tint
                  : colors.active.secondaryText
              }
            />
          )}
        />
        <IconButton
          altTitle="Strikethrough"
          size="sm"
          onPress={() => {
            editor?.chain().focus().toggleStrike().run();
          }}
          icon={({ size }) => (
            <Icon
              name="strikethrough"
              size={size}
              color={
                isFocused && editor?.isActive("strike")
                  ? colors.active.tint
                  : colors.active.secondaryText
              }
            />
          )}
        />
        <IconButton
          altTitle="Code"
          size="sm"
          onPress={() => {
            editor?.chain().focus().toggleCode().run();
          }}
          icon={({ size }) => (
            <Icon
              name="code"
              size={size}
              color={
                isFocused && editor?.isActive("code")
                  ? colors.active.tint
                  : colors.active.secondaryText
              }
            />
          )}
        />
        <View
          style={{
            borderRadius: 6,
            flexDirection: "row",
            backgroundColor:
              isFocused && typeof linkNodeHref === "string"
                ? colors.active.tint
                : "transparent",
          }}
        >
          <IconButton
            altTitle="Link"
            size="sm"
            onPress={() => {
              if (typeof linkNodeHref === "string") {
                editor?.chain().focus().unsetLink().run();
              } else {
                editHref(linkNodeHref);
              }
            }}
            icon={({ size }) => (
              <Icon
                name="link"
                size={size}
                color={
                  isFocused && typeof linkNodeHref === "string"
                    ? colors.inverted.text
                    : colors.active.secondaryText
                }
              />
            )}
          />
          {isFocused && typeof linkNodeHref === "string" ? (
            <IconButton
              altTitle="Edit Link"
              size="sm"
              onPress={() => {
                editHref(linkNodeHref);
              }}
              icon={({ size }) => (
                <Icon name="edit" size={size} color={colors.inverted.text} />
              )}
            />
          ) : null}
          {isFocused && typeof linkNodeHref === "string" ? (
            <a
              target="_blank"
              href={linkNodeHref}
              style={{ textDecoration: "none", padding: 8 }}
            >
              <Icon
                name="external-link"
                size={18}
                color={colors.inverted.text}
              />
            </a>
          ) : null}
        </View>
      </View>
    </View>
  );
}
HumanTextInput.import = (value: FromSchema<typeof HumanTextSchema>) => {
  const paragraphContent: any[] = [];
  value?.forEach((valueNode) => {
    const marks: any[] = [];
    if (valueNode.bold) marks.push({ type: "bold" });
    if (valueNode.italic) marks.push({ type: "italic" });
    if (valueNode.strike) marks.push({ type: "strike" });
    if (valueNode.underline) marks.push({ type: "underline" });
    if (valueNode.code) marks.push({ type: "code" });
    if (valueNode.linkHref)
      marks.push({ type: "link", attrs: { href: valueNode.linkHref } });
    paragraphContent.push({
      type: "text",
      text: valueNode.text,
      marks,
    });
  });
  const jsonValue = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: paragraphContent,
      },
    ],
  };
  return jsonValue;
};
type ExportTextNode = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  linkHref?: string;
};
const RETURN = `
`;
HumanTextInput.export = (value) => {
  const output: FromSchema<typeof HumanTextSchema> = [];
  if (value.type !== "doc")
    throw new Error("Unexpected export condition: not a doc node");
  value.content?.forEach((docChild, paragraphIndex) => {
    if (docChild.type !== "paragraph")
      throw new Error("Unexpected export condition: not a paragraph node");
    if (paragraphIndex > 0) output.push({ text: RETURN });
    docChild.content?.forEach((paragraphChild) => {
      if (paragraphChild.type !== "text")
        throw new Error("Unexpected export condition: not a text node");
      const n: ExportTextNode = { text: paragraphChild.text };
      paragraphChild.marks?.forEach((mark) => {
        if (mark.type === "bold") n.bold = true;
        else if (mark.type === "italic") n.italic = true;
        else if (mark.type === "strike") n.strike = true;
        else if (mark.type === "underline") n.underline = true;
        else if (mark.type === "code") n.code = true;
        else if (mark.type === "link") {
          n.linkHref = mark.attrs.href;
        } else
          throw new Error(
            "Unexpected export condition: unexpected mark node: " + mark.type,
          );
      });
      output.push(n);
    });
  });
  return output;
};
HumanTextInput.renderAsText = (value) => {
  let outputString = "";
  if (value.type !== "doc")
    throw new Error("Unexpected export condition: not a doc node");
  value.content?.forEach((docChild, paragraphIndex) => {
    if (docChild.type !== "paragraph")
      throw new Error("Unexpected export condition: not a paragraph node");
    if (paragraphIndex > 0) output.push({ text: RETURN });
    docChild.content?.forEach((paragraphChild) => {
      if (paragraphChild.type !== "text")
        throw new Error("Unexpected export condition: not a text node");
      outputString += paragraphChild.text;
      // todo maybe, render marks in output text
    });
  });
  return outputString;
};
