import { Card, LinkRow, ThemedText } from "@zerve/zen";
import React, { useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { HomeStackScreenProps } from "../app/Links";
import { useHistoryEvent } from "../app/History";
import { format } from "date-fns";
import NotFoundScreen from "./NotFoundScreen";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";

export default function HistoryEventScreen({
  navigation,
  route,
}: HomeStackScreenProps<"HistoryEvent">) {
  const { eventId } = route.params;
  const event = useHistoryEvent(eventId);
  if (!event) return <NotFoundScreen />;
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={event.title} />
      <ThemedText>{format(new Date(event.time), "p P")}</ThemedText>
      <JSONSchemaEditor value={event.body} schema={{}} />
    </ScreenContainer>
  );
}
