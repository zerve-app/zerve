import { FieldComponentProps, FromSchema, HumanTextSchema } from "@zerve/core";
import { useEditor, EditorContent } from "@tiptap/react";
import { View } from "react-native";
import Bold, { BoldOptions } from "@tiptap/extension-bold";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import StarterKit from "@tiptap/starter-kit";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import { useColors } from "./useColors";
import Layout from "./Layout";

export function HumanTextInput(
  props: FieldComponentProps<typeof HumanTextSchema>,
) {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold],
    content: props.value,
    editable: !!props?.onValue,
    onUpdate: ({ editor }) => {
      const editorJSON = editor.getJSON();
      // debugger;
      props?.onValue(editorJSON);
    },
  });
  const colors = useColors();
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
          backgroundColor: colors.background,
        }}
      >
        <EditorContent style={{ overflow: "hidden" }} editor={editor} />
      </View>
      <IconButton
        altTitle="Bold"
        onPress={() => {
          editor?.chain().focus().toggleBold().run();
        }}
        icon={
          <Icon
            name="bold"
            color={editor?.isActive("bold") ? colors.tint : colors.text}
          />
        }
      />
    </View>
  );
}
HumanTextInput.import = (value: FromSchema<typeof HumanTextSchema>) => {
  // const lol = {
  //   type: "doc",
  //   content: [
  //     {
  //       type: "paragraph",
  //       content: [
  //         { type: "text", text: "aa" },
  //         { type: "text", marks: [{ type: "bold" }], text: "s" },
  //         { type: "text", text: "df" },
  //       ],
  //     },
  //   ],
  // };
  const paragraphContent: any[] = [];
  value.forEach((valueNode) => {
    const marks: any[] = [];
    if (valueNode.bold) marks.push({ type: "bold" });
    paragraphContent.push({
      type: "text",
      text: valueNode.text,
      marks,
    });
  });
  console.log("== IMPORTED HTEXTVALUE:", paragraphContent);
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
};
const RETURN = `
`;
HumanTextInput.export = (value) => {
  console.log("== EXPORTING HTEXTVALUE:", value);
  const output: FromSchema<typeof HumanTextSchema> = [];
  if (value.type !== "doc")
    throw new Error("Unexpected export condition: not a doc node");
  value.content.forEach((docChild, paragraphIndex) => {
    if (docChild.type !== "paragraph")
      throw new Error("Unexpected export condition: not a paragraph node");
    if (paragraphIndex > 0) output.push({ text: RETURN });
    docChild.content.forEach((paragraphChild) => {
      if (paragraphChild.type !== "text")
        throw new Error("Unexpected export condition: not a text node");
      const n: ExportTextNode = { text: paragraphChild.text };
      paragraphChild.marks?.forEach((mark) => {
        if (mark.type === "bold") n.bold = true;
        else
          throw new Error(
            "Unexpected export condition: unexpected mark node: " + mark.type,
          );
      });
      output.push(n);
    });
  });
  console.log("== EXPORTED HTEXTVALUE:", output);
  return output;
};
