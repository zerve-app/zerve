import React, { createContext, ReactNode, useContext } from "react";
import { useRouter } from "next/router";

export const NavigateInterceptContext = createContext<
  null | ((href: string) => boolean)
>(null);

export function Link({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const { push } = useRouter();
  const navigateIntercept = useContext(NavigateInterceptContext);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      onClick={(e) => {
        if (external) return;
        e.preventDefault();
        if (navigateIntercept) {
          const shouldAllow = navigateIntercept(href);
          if (shouldAllow) push(href);
        } else {
          push(href);
        }
      }}
      style={{ textDecoration: "none", display: "flex" }}
    >
      {children}
    </a>
  );
}
