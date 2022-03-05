import { ReactNode, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { Spinner } from "./Spinner";
import { IconButton } from "./Button";
import { Icon } from "./Icon";

export function DisclosureSection({
  children,
  header,
  isLoading,
  right,
}: {
  children: ReactNode;
  header: ReactNode;
  isLoading?: boolean;
  right?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleDisclosure = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "stretch",
        }}
      >
        <IconButton
          onPress={toggleDisclosure}
          size={"sm"}
          altTitle={isOpen ? "Hide Section" : "Open Section"}
          icon={(props) =>
            isOpen ? (
              <Icon {...props} name="chevron-down" />
            ) : (
              <Icon {...props} name="chevron-right" />
            )
          }
        />

        <TouchableOpacity
          onPress={toggleDisclosure}
          containerStyle={{ flex: 1 }}
          hitSlop={{ right: 0, top: 10, bottom: 10, left: 10 }}
        >
          {header}
        </TouchableOpacity>
        {isLoading && <Spinner />}
        {right}
      </View>

      {isOpen && <View style={{ paddingLeft: 12 }}>{children}</View>}
    </View>
  );
}
