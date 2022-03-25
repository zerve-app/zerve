import React, { ReactNode } from "react";
import { Spinner, Title } from "@zerve/ui";
import { View } from "react-native";
import { BackButton } from "./AppPage";

export default function ScreenHeader({
  title,
  isLoading,
  backButtonCancelStyle,
  corner,
}: {
  title: string;
  backButtonCancelStyle?: boolean;
  isLoading?: boolean;
  corner?: ReactNode;
}) {
  return (
    <View>
      <BackButton />
      <Title title={title} />
      {isLoading && <Spinner />}
      {corner}
    </View>
  );
}
