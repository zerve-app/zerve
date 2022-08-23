import { ThemedText, VStack } from "@zerve/zen";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { HomeStackScreenProps } from "../app/Links";
import { useHistoryEvent } from "../app/History";
import { format } from "date-fns";
import NotFoundScreen from "./NotFoundScreen";
import { JSONSchemaEditor } from "@zerve/zen/JSONSchemaEditor";
import { EmptySchemaStore } from "@zerve/core";

export default function HistoryEventScreen({
  navigation,
  route,
}: HomeStackScreenProps<"HistoryEvent">) {
  const { eventId } = route.params;
  const event = useHistoryEvent(eventId);
  if (!event) return <NotFoundScreen />;
  return (
    <ScreenContainer scroll safe>
      <ScreenHeader title={event.title} />
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
