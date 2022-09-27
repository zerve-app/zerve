import {
  Button,
  DisclosureSection,
  Label,
  ThemedText,
  VStack,
} from "@zerve/zen";
import { reportHistoryEvent, useHistory } from "../app/History";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@zerve/zen/ScreenContainer";

function HistoryList() {
  const a = useHistory(10);
  return <ThemedText>{JSON.stringify(a)}</ThemedText>;
}

export default function TestHistoryScreen() {
  const { navigate } = useNavigation();
  return (
    <ScreenContainer scroll>
      <DisclosureSection header={<Label>History Events</Label>}>
        <VStack>
          <Button
            title="History Event"
            onPress={() => {
              reportHistoryEvent(
                "Test Event",
                `This is the text body of the test event that happened in your history.`,
              );
            }}
          />
          <Button
            title="3x History Event (quickly)"
            onPress={() => {
              reportHistoryEvent(
                "Test Event A",
                `This is the text body of the test event that happened in your history.`,
              );
              reportHistoryEvent(
                "Test Event B",
                `This is the text body of the test event that happened in your history.`,
              );
              setTimeout(() => {
                reportHistoryEvent(
                  "Test Event C",
                  `This is the text body of the test event that happened in your history.`,
                );
              }, 5);
            }}
          />
        </VStack>
      </DisclosureSection>
      <DisclosureSection header={<Label>History Events</Label>}>
        <VStack>
          <HistoryList />
        </VStack>
      </DisclosureSection>
    </ScreenContainer>
  );
}
