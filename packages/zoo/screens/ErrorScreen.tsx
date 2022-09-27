import { RootStackScreenProps } from "../app/Links";
import { Paragraph } from "@zerve/zen";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";

export default function ErrorScreen({
  navigation,
  route,
}: RootStackScreenProps<"Error">) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title={
          route.params.error.code
            ? `Error: ${route.params.error.code}`
            : "App Error"
        }
      />
      <Paragraph>{route.params.error.message}</Paragraph>
      <Paragraph>{JSON.stringify(route.params.error.details)}</Paragraph>
    </ScreenContainer>
  );
}
