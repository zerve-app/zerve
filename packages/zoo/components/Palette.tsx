import { useAction } from "@zerve/react";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "@zerve/ui";

import { useAppDispatch } from "../stores/Dispatch";
import { useKeyboardEffect } from "../stores/Keyboard";

type PaletteAction = {
  key: string;
  type: "LocalAction";
  actionType: string;
  label: (args: { query }) => string;
  payload?: any;
  requiresStringInput?: boolean;
  inputPlaceholder?: string;
  description?: string;
};

export default function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  const [actionKey, setActionKey] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [pendingAction, setPendingAction] = useState<null | PaletteAction>(
    null
  );

  useKeyboardEffect("escape", onClose);

  function handleUp() {
    if (actionKey === null || actionKey === actions[0]?.key) {
      setActionKey(actions[actions.length - 1].key);
    } else {
      const currentIndex = actions.findIndex((a) => a.key === actionKey);
      setActionKey(actions[currentIndex - 1].key);
    }
  }

  function handleDown() {
    if (actionKey === null) {
      setActionKey(actions[1]?.key);
    } else if (actionKey === actions[actions.length - 1].key) {
      setActionKey(actions[0]?.key);
    } else {
      const currentIndex = actions.findIndex((a) => a.key === actionKey);
      setActionKey(actions[currentIndex + 1].key);
    }
  }

  function handleSubmit() {
    const selectedAction = actionKey
      ? actions.find((a) => a.key === actionKey)
      : actions[0];
    dispatch(selectedAction);
  }
  function handleSpace() {
    const queryLower = query.toLowerCase();

    const matchedAction = actions.find((a) => a.key === queryLower);

    if (matchedAction) {
      setPendingAction(matchedAction);
      setQuery("");
    }
    return !!matchedAction;
  }
  function handleTab() {
    if (!pendingAction) {
      const action = actionKey ? actions[actionKey] : actions[0];
      setPendingAction(action);
      setQuery("");
    }
  }
  function handleDelete() {
    if (query === "" && pendingAction) {
      setPendingAction(null);
    }
    return false;
  }
  const allActions: PaletteAction[] = [
    {
      type: "LocalAction",
      actionType: "Create",
      payload: { name: query },
      label: ({ query }) => `Create Doc: ${query}`,
      key: "create",
      description: "create a local doc",
      inputPlaceholder: "doc name",
      requiresStringInput: true,
    },
    {
      type: "LocalAction",
      actionType: "Open",
      payload: { name: query },
      label: ({ query }) => `Open: ${query}`,
      key: "open",
      description: "open a file, directory, block",
      inputPlaceholder: "name or block id",
      requiresStringInput: true,
    },
    {
      type: "LocalAction",
      actionType: "Debug",
      label: () => "Debug..",
      key: "Debug",
    },
  ];
  const matchedActions = allActions.filter((a) => {
    if (
      query.length &&
      a
        .label({ query })
        .toLowerCase()
        .match(new RegExp(`^${query.toLowerCase()}`))
    )
      return true;
    return false;
  });
  const actions = matchedActions.length ? matchedActions : allActions;

  const selectedActionKey = actionKey ? actionKey : actions[0].key;

  const blurEffectRef = useRef<"close" | "ignore">("close");
  const textInputRef = useRef<TextInput | null>(null);

  return (
    <View
      style={{
        position: "absolute",
        top: 24,
        right: 0,
        left: 0,
        alignItems: "center",
      }}
    >
      <View
        style={{
          overflow: "hidden",
          backgroundColor: "#333",
          width: 700,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", flex: 1 }}>
          {pendingAction && (
            <View
              style={{
                backgroundColor: "#666",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#ccc",
                  padding: 20,
                  flexDirection: "row",
                  fontSize: 42,
                }}
              >
                {pendingAction.key}:
              </Text>
            </View>
          )}

          <TextInput
            style={{
              flex: 1,
              alignSelf: "stretch",
              backgroundColor: "#000",
              // @ts-ignore
              outlineColor: "#cde",
              color: "#eee",
              fontSize: 42,
              lineHeight: 56,
              padding: 20,
              margin: 16,
            }}
            autoFocus
            value={query}
            ref={textInputRef}
            onChangeText={setQuery}
            onSubmitEditing={(e) => {
              handleSubmit();
              blurEffectRef.current = "ignore";
              e.preventDefault();
            }}
            onBlur={() => {
              if (blurEffectRef.current === "ignore") return;
              if (blurEffectRef.current === "close") {
                onClose();
              }
            }}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "ArrowDown") {
                e.preventDefault();
                handleDown();
              } else if (e.nativeEvent.key === "ArrowUp") {
                e.preventDefault();
                handleUp();
              } else if (e.nativeEvent.key === " ") {
                handleSpace() && e.preventDefault();
              } else if (e.nativeEvent.key === "Backspace") {
                handleDelete() && e.preventDefault();
              } else if (e.nativeEvent.key === "Escape") {
                onClose();
              } else if (e.nativeEvent.key === "Tab") {
                e.preventDefault();
                handleTab();
              } else {
                // console.log(e.nativeEvent.key);
              }
            }}
            placeholder={
              pendingAction?.inputPlaceholder
                ? pendingAction?.inputPlaceholder
                : "action/file search (or new doc)"
            }
          />
        </View>
        {pendingAction && <Text>{pendingAction.description}</Text>}

        {!pendingAction &&
          actions.map((action, index) => {
            const isSelected = selectedActionKey
              ? action.key === selectedActionKey
              : index === 0;

            return (
              <TouchableOpacity
                key={action.key}
                onPress={() => {
                  setPendingAction(action);
                }}
              >
                <View
                  style={{
                    padding: 12,
                    marginVertical: 4,
                    marginHorizontal: 16,
                    backgroundColor: isSelected ? "#fcfcfc" : "#0000",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#222" : "#eee",
                      fontSize: 26,
                    }}
                  >
                    {action.label({ query: query })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}
