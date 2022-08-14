import React, { ReactNode } from "react";
import { useRouter } from "next/router";

export function Link({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { push } = useRouter();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        push(href);
      }}
      style={{ textDecoration: "none" }}
    >
      {children}
    </a>
  );
}
