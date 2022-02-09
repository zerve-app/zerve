import { useAction } from "agent-react";
import { useCallback } from "react";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button } from "ui";

import { useAppDispatch } from "../stores/Dispatch";

type PaletteAction = {
  key: string;
  type: "LocalAction";
  actionType: string;
  label: (args: { query }) => string;
  payload?: any;
  requiresStringInput?: boolean;
};

function useActionQuery(query: string, setPaletteQuery: (s: string) => void) {
  const [actionKey, setActionKey] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [pendingAction, setPendingAction] = useState<null | PaletteAction>(
    null
  );

  function handleUp() {
    if (actionKey === null || actionKey === actions[0]?.key) {
      setActionKey(actions[actions.length - 1].key);
    } else {
      const currentIndex = actions.findIndex((a) => a.key === actionKey);
      setActionKey(actions[currentIndex - 1].key);
    }
  }

  function handleDown() {
    if (actionKey === null || actionKey === actions[actions.length - 1].key) {
      setActionKey(actions[0]?.key);
    } else {
      const currentIndex = actions.findIndex((a) => a.key === actionKey);
      setActionKey(actions[currentIndex + 1].key);
    }
  }

  function handleSubmit() {
    dispatch(actionKey ? actions.find((a) => a.key === actionKey) : actions[0]);
  }
  function handleSpace() {
    const queryLower = query.toLowerCase();

    const matchedAction = actions.find((a) => a.key === queryLower);

    if (matchedAction) {
      setPendingAction(matchedAction);
      setPaletteQuery("");
    }
    console.log("space", matchedAction);
    return !!matchedAction;
  }
  function handleTab() {
    if (!pendingAction) {
      const action = actionKey ? actions[actionKey] : actions[0];
      setPendingAction(action);
      setPaletteQuery("");
    }
  }
  function handleDelete() {
    if (query === "" && pendingAction) {
      setPendingAction(null);
    }
    console.log("Delete");
    return false;
  }
  const allActions: PaletteAction[] = [
    {
      type: "LocalAction",
      actionType: "Create",
      payload: { name: query },
      label: ({ query }) => `Create Doc: ${query}`,
      key: "create",
      requiresStringInput: true,
    },
    {
      type: "LocalAction",
      actionType: "Open",
      payload: { name: query },
      label: ({ query }) => `Open: ${query}`,
      key: "open",
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
  if (!matchedActions.length) {
  }

  const nonPendingSelectedActionKey = actionKey ? actionKey : actions[0].key;
  return {
    pendingAction,
    actions: pendingAction ? [pendingAction] : actions,
    selectedActionKey: pendingAction
      ? pendingAction.key
      : nonPendingSelectedActionKey,
    setSelectedActionKey: setActionKey,
    handleUp,
    handleDown,
    handleDelete,
    handleSubmit,
    handleSpace,
    handleTab,
  };
}

export default function Palette({ onClose }: { onClose: () => void }) {
  const [paletteQuery, setPaletteQuery] = useState("");

  const {
    actions,
    selectedActionKey,
    setSelectedActionKey,
    handleUp,
    handleDown,
    handleDelete,
    handleSubmit,
    handleSpace,
    handleTab,
    pendingAction,
  } = useActionQuery(paletteQuery, setPaletteQuery);

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
                backgroundColor: "#6662",
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
              backgroundColor: "#0000",
              outlineColor: "#cde",
              color: "#eee",
              fontSize: 42,
              lineHeight: 56,
              padding: 20,
              margin: 16,
            }}
            autoFocus
            value={paletteQuery}
            onChangeText={setPaletteQuery}
            onSubmitEditing={handleSubmit}
            onBlur={() => {
              onClose();
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
                console.log(e.nativeEvent.key);
              }
            }}
            placeholder="action/file search (or new doc)"
          />
        </View>

        {actions.map((action, index) => {
          const isSelected = selectedActionKey
            ? action.key === selectedActionKey
            : index === 0;

          return (
            <View
              style={{
                padding: 12,
                marginVertical: 4,
                marginHorizontal: 16,
                backgroundColor: isSelected ? "#fcfcfc" : "#0000",
                borderRadius: 8,
              }}
              key={action.key}
            >
              <Text
                style={{
                  color: isSelected ? "#222" : "#eee",
                  fontSize: 26,
                }}
              >
                {action.label({ query: paletteQuery })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
