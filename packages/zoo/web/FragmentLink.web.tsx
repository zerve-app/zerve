import { useContext } from "react";
import { FragmentLinkProps } from "./Fragment";

export function FragmentLink<FragmentState>({
  to,
  children,
  Context,
  backgroundColor,
}: FragmentLinkProps<FragmentState>) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render FragmentLink outside of a FragmentContext");
  const { stringifyFragment, navigateFragment } = fragmentContext;
  return (
    <a
      style={{
        textDecoration: "none",
        // its important for the link itself to have the background color set, not the children. this allows the focus ring to be visible on web
        backgroundColor,
      }}
      href={to ? `?_=${stringifyFragment(to)}` : "?"}
      onClickCapture={(e) => {
        if (e.metaKey) {
          // user is *probably* pressing this key to open the link in a new tab
          e.stopPropagation();
          return;
          // stop propogation of event that would flow to children components, to avoid other components from handling this navigation
        }
        e.preventDefault();
        e.stopPropagation();
        navigateFragment(to);
      }}
    >
      {children}
    </a>
  );
}
