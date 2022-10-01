import { ReactNode } from "react";
import { ButtonContent, ButtonContentProps } from "./Button";
import { Link } from "./Link";
import { ThemedText } from "./Themed";

export function ExternalLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href}>
      <ThemedText
        tint
        style={{
          textDecorationLine: "underline",
          fontSize: 24,
          margin: 32,
        }}
      >
        {children}
      </ThemedText>
    </Link>
  );
}

export function LinkButton({
  href,
  onPress,
  ...buttonContentProps
}: {
  href: string;
  onPress: () => void;
} & ButtonContentProps) {
  return (
    <Link href={href} onPress={onPress}>
      <ButtonContent textAlign="left" {...buttonContentProps} />
    </Link>
  );
}
