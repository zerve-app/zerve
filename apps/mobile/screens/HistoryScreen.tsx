import { Card, LinkRow, ThemedText } from "@zerve/ui";
import React, { useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { HistoryEvent, useHistory } from "../app/History";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { format } from "date-fns";

function HistoryScreenHeader() {
  return <ScreenHeader title="Local Event History" />;
}

export default function HistoryScreen() {
  const [queryCount, setQueryCount] = useState(15);
  const events = useHistory(queryCount);
  return (
    <ScreenContainer>
      <FlatList
        data={events}
        ListHeaderComponent={HistoryScreenHeader}
        renderItem={(item) => (
          <Card
            key={item.item.key}
            title={item.item.title}
            secondary={format(new Date(item.item.time), "MM/dd/yyyy")}
            // onPress={() => {}}
          >
            <ThemedText oneLine>{JSON.stringify(item.item.body)}</ThemedText>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
