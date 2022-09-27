import { ThemedText, VStack } from "@zerve/zen";
import { HomeStackScreenProps } from "../app/Links";
import { useHistoryEvent } from "../app/History";
import { format } from "date-fns";
import NotFoundScreen from "./NotFoundScreen";
import { JSONSchemaEditor } from "@zerve/zen/JSONSchemaEditor";
import { EmptySchemaStore } from "@zerve/zed";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";

export default function HistoryEventScreen({
  navigation,
  route,
}: HomeStackScreenProps<"HistoryEvent">) {
  const { eventId } = route.params;
  const event = useHistoryEvent(eventId);
  if (!event) return <NotFoundScreen />;
  const { goBack } = useNavigation();
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={event.title} onBack={goBack} />
      <VStack padded>
        <ThemedText>{format(new Date(event.time), "p P")}</ThemedText>
        <JSONSchemaEditor
          value={event.body}
          schema={{}}
          id="events"
          schemaStore={EmptySchemaStore}
        />
      </VStack>
    </ScreenContainer>
  );
}
