import { Paragraph } from "@zerve/zen/Text";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Not Found." />
      <Paragraph>This screen doesn't exist.</Paragraph>
    </ScreenContainer>
  );
}
