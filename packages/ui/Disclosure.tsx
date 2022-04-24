import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Spinner } from "./Spinner";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import { useColors } from "./useColors";
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function DisclosureSection({
  children,
  header,
  isLoading,
  right,
  defaultIsOpen = true,
}: {
  children: ReactNode;
  header: ReactNode;
  isLoading?: boolean;
  right?: ReactNode;
  defaultIsOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const childrenHeight = useSharedValue(1);
  const childrenContainer = useAnimatedRef();
  const doMeasure = runOnUI(() => {
    "worklet";
    childrenHeight.value = measure(childrenContainer).height;
  });
  const toggleDisclosure = useCallback(() => {
    doMeasure();
    setIsOpen((isOpen) => !isOpen);
  }, []);
  const openValue = useSharedValue(defaultIsOpen ? 1 : 0);
  const childrenContainerOuterStyle = useAnimatedStyle(() => ({
    display: "flex",
    // display: openValue.value === 0 ? "none" : "flex",
    height:
      openValue.value === 0
        ? 1
        : openValue.value === 1
        ? -1
        : openValue.value * childrenHeight.value,
    overflow: "hidden",
    justifyContent: "flex-start",
  }));
  const childrenContainerInnerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - openValue.value) * childrenHeight.value }],
  }));
  useEffect(() => {
    openValue.value = withTiming(isOpen ? 1 : 0, {
      duration: 250,
    });
  }, [isOpen]);
  const colors = useColors();
  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: `${colors.secondaryText}33`,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "stretch",
          minHeight: 52,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={toggleDisclosure}
          containerStyle={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
          hitSlop={{ right: 0, top: 10, bottom: 10, left: 10 }}
        >
          {header}
        </TouchableOpacity>
        {isLoading && <Spinner />}
        {isOpen && right}
        <IconButton
          onPress={toggleDisclosure}
          size={"sm"}
          altTitle={isOpen ? "Hide Section" : "Open Section"}
          icon={(props) => (
            <Icon {...props} name={isOpen ? "chevron-down" : "chevron-right"} />
          )}
        />
      </View>

      <Animated.View style={childrenContainerOuterStyle}>
        <Animated.View
          ref={childrenContainer}
          style={childrenContainerInnerStyle}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
}
