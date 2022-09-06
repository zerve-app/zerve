import { useContext } from "react";
import { FragmentLinkProps } from "./Fragment";

export function FragmentLink<FragmentState>({
  to,
  children,
  Context,
}: FragmentLinkProps<FragmentState>) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render FragmentLink outside of a FragmentContext");
  const { stringifyFragment, navigateFragment } = fragmentContext;
  return (
    <a
      style={{ textDecoration: "none" }}
      href={`?_=${stringifyFragment(to)}`}
      onClickCapture={(e) => {
        if (e.metaKey) {
          // user is *probably* pressing this key to open the link in a new tab
          e.stopPropagation();
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
