import React, { createContext, ReactNode, useContext } from "react";
import { useRouter } from "next/router";

export const NavigateInterceptContext = createContext<
  null | ((href: string) => boolean)
>(null);

export function Link({
  href,
  children,
  external,
  inline,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  inline?: boolean;
}) {
  const { push } = useRouter();
  const navigateIntercept = useContext(NavigateInterceptContext);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      onClick={(e) => {
        if (external) return;
        if (e.metaKey) return; // user is *probably* pressing this key to open the link in a new tab
        e.preventDefault();
        if (navigateIntercept) {
          const shouldAllow = navigateIntercept(href);
          if (shouldAllow) push(href);
        } else {
          push(href);
        }
      }}
      style={{
        textDecoration: "none",
        display: inline ? "inline" : "block",
      }}
    >
      {children}
    </a>
  );
}
