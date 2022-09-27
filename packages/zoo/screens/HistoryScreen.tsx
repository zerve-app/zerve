import { useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useHistory } from "../app/History";
import { format } from "date-fns";
import { HomeStackScreenProps } from "../app/Links";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { insetsPadding } from "@zerve/zen/InsetUtils";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { Card } from "@zerve/zen/Card";
import { ThemedText } from "@zerve/zen/Themed";

function HistoryScreenHeader() {
  const { goBack } = useNavigation();
  return <ScreenHeader title="Local Event History" onBack={goBack} />;
}

export default function HistoryScreen({
  navigation,
}: HomeStackScreenProps<"History">) {
  const [queryCount, setQueryCount] = useState(15);
  const events = useHistory(queryCount);
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer>
      <FlatList
        data={events}
        contentContainerStyle={insetsPadding(insets)}
        ListHeaderComponent={HistoryScreenHeader}
        renderItem={(item) => (
          <Card
            key={item.item.id}
            title={item.item.title}
            secondary={format(new Date(item.item.time), "MM/dd/yyyy")}
            onPress={() => {
              navigation.navigate("HistoryEvent", { eventId: item.item.id });
            }}
          >
            <ThemedText oneLine>{JSON.stringify(item.item.body)}</ThemedText>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
