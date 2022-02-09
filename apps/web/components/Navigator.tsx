import { useRouter } from "next/router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "ui";

import { useAppDispatch } from "../stores/Dispatch";
import { useDocListQuery } from "./Query";

export default function Navigator() {
  const { data, isLoading } = useDocListQuery();
  const { query } = useRouter();
  const dispatch = useAppDispatch();

  return (
    <View
      style={{
        borderRadius: 8,
        margin: 16,
        flex: 1,
        backgroundColor: "#ecf8ff",
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 7.65,
        elevation: 8,
      }}
    >
      {isLoading ? (
        <Text>Loading</Text>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {data.docs.children.map((childDocName) => (
            <View style={{}} key={childDocName}>
              <Text
                accessibilityRole="link"
                href={`/shell/doc/${childDocName}`}
                style={{
                  color: query.docId === childDocName ? "#000" : "blue",
                }}
              >
                {childDocName}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={{ backgroundColor: "#ccc", height: 50 }}>
        <Button
          onPress={() => {
            dispatch({});
          }}
          title="Create Doc"
        />
      </View>
    </View>
  );
}
