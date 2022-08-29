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
  ...buttonContentProps
}: {
  href: string;
} & ButtonContentProps) {
  return (
    <Link href={href}>
      <ButtonContent {...buttonContentProps} />
    </Link>
  );
}
