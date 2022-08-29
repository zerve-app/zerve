import { ReactNode } from "react";
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
