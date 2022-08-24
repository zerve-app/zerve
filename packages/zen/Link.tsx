import React, { createContext, ReactNode, useContext } from "react";
import { useRouter } from "next/router";

export const NavigateInterceptContext = createContext<
  null | ((href: string) => boolean)
>(null);

export function Link({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { push } = useRouter();
  const navigateIntercept = useContext(NavigateInterceptContext);
  return (
    <a
      href={href}
      onClick={(e) => {
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
