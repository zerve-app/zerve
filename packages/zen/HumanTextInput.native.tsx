import Delta from "quill-delta";
import { useCallback, useRef, useState } from "react";
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Notice } from "./Notice";

type CustomAttributes = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
};

type Selection = {
  start: number;
  end: number;
};

function useAttributeCallback(
  delta: Delta,
  onDelta: (d: Delta) => void,
  selection: Selection,
  attribute: keyof CustomAttributes,
  applyingAttributes: CustomAttributes,
  setApplyingAttributes: (c: CustomAttributes) => void,
) {
  return useCallback(() => {
    const willApply = !applyingAttributes[attribute];
    const newApplyingAttributes = {
      ...applyingAttributes,
      [attribute]: willApply,
    };
    setApplyingAttributes(newApplyingAttributes);
    const newDelta = new Delta()
      .retain(selection.start)
      .retain(selection.end - selection.start, { [attribute]: willApply });
    onDelta(delta.compose(newDelta));
  }, [
    delta,
    onDelta,
    selection,
    attribute,
    applyingAttributes,
    setApplyingAttributes,
  ]);
}
const noAttributes: CustomAttributes = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
};

export function HumanTextInput({
  delta,
  onDelta,
}: {
  delta: Delta;
  onDelta: (d: Delta) => void;
}) {
  return <Notice message="HumanText not supported on mobile yet." />;
  const [selection, setSelection] = useState<null | Selection>(null);
  const [applyingAttributes, setApplyingAttributes] =
    useState<CustomAttributes>(noAttributes);
  const textInputRef = useRef<TextInput>();
  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.textInput}
        multiline
        onSelectionChange={(e) => {
          const { selection } = e.nativeEvent;
          const isRangeSelection = selection.start !== selection.end;
          const lastCharDelta = isRangeSelection
            ? delta.slice(selection.start, selection.start + 1)
            : delta.slice(selection.start - 1, selection.start);
          const firstCharOp = lastCharDelta.ops[0];
          const currentAppliedAttributes: CustomAttributes =
            firstCharOp?.attributes as CustomAttributes;
          if (currentAppliedAttributes) {
            setApplyingAttributes(currentAppliedAttributes);
          }
          setSelection(selection);
        }}
        ref={textInputRef}
        onBlur={() => {
          setSelection(null);
        }}
        // selection={Platform.select({ ios: undefined, android: selection })}
        onTextInput={(e) => {
          const { text, range } = e.nativeEvent;
          const newDelta = new Delta()
            .retain(range.start)
            .delete(range.end - range.start)
            .insert(text, applyingAttributes);
          onDelta(delta.compose(newDelta));
        }}
      >
        {delta.map((op, index) => {
          if (typeof op.insert === "string") {
            const { bold, italic, strikethrough, underline } =
              op.attributes || {};
            return (
              <Text
                key={index}
                style={{
                  fontWeight: bold ? "bold" : "normal",
                  fontStyle: italic ? "italic" : "normal",
                  textDecorationLine: underline
                    ? strikethrough
                      ? "underline line-through"
                      : "underline"
                    : strikethrough
                    ? "line-through"
                    : "none",
                }}
              >
                {op.insert}
              </Text>
            );
          } else {
            return null;
          }
        })}
        <Text />
      </TextInput>
      <View style={styles.toolbar}>
        <Button
          title="Bold"
          color={applyingAttributes.bold ? "grey" : "blue"}
          onPress={useAttributeCallback(
            delta,
            onDelta,
            selection,
            "bold",
            applyingAttributes,
            setApplyingAttributes,
          )}
        />
        <Button
          title="Italic"
          color={applyingAttributes.italic ? "grey" : "blue"}
          onPress={useAttributeCallback(
            delta,
            onDelta,
            selection,
            "italic",
            applyingAttributes,
            setApplyingAttributes,
          )}
        />
        <Button
          title="Underline"
          color={applyingAttributes.underline ? "grey" : "blue"}
          onPress={useAttributeCallback(
            delta,
            onDelta,
            selection,
            "underline",
            applyingAttributes,
            setApplyingAttributes,
          )}
        />
        <Button
          title="Strikethrough"
          color={applyingAttributes.strikethrough ? "grey" : "blue"}
          onPress={useAttributeCallback(
            delta,
            onDelta,
            selection,
            "strikethrough",
            applyingAttributes,
            setApplyingAttributes,
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function MediocreText({ document }: { document: Delta }) {
  return (
    <Text>
      {document.map((op, index) => {
        if (typeof op.insert === "string") {
          const { bold, italic, strikethrough, underline } =
            op.attributes || {};
          return (
            <Text
              key={index}
              style={{
                fontWeight: bold ? "bold" : "normal",
                fontStyle: italic ? "italic" : "normal",
                textDecorationLine: underline
                  ? strikethrough
                    ? "underline line-through"
                    : "underline"
                  : strikethrough
                  ? "line-through"
                  : "none",
              }}
            >
              {op.insert}
            </Text>
          );
        } else {
          return null;
        }
      })}
    </Text>
  );
}

export default function App() {
  const [inputState, setInputState] = useState(
    new Delta([
      { insert: "Hello " },
      { insert: "working class ", attributes: { italic: true } },
      { insert: "TextInput ", attributes: { bold: true } },
      { insert: "on " },
      { insert: "React Native", attributes: { bold: true, italic: true } },
    ]),
  );
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <MediocreTextInput
          delta={inputState}
          onDelta={(delta) => {
            setInputState(delta);
          }}
        />
        <Text>Current State:</Text>
        <MediocreText document={inputState} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  safeArea: {
    alignSelf: "stretch",
  },
  toolbar: {
    borderWidth: 1,
    borderTopWidth: 0,
    minHeight: 30,
    backgroundColor: "#eee",
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderColor: "#ccc",
    flexDirection: "row",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    minHeight: 120,
    textAlignVertical: "top",
  },
});
