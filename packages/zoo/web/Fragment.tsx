import React, { Context, ReactNode, useContext, useMemo } from "react";
import { useRouter } from "next/router";

export type FragmentContext<FragmentState> = {
  stringifyFragment: (feature: FragmentState) => string;
  parseFragment: (fragment: string) => FragmentState | null;
  navigateFragment: (fragmentState: FragmentState) => void;
  fragment: FragmentState | null;
  fragmentString: string;
};

export function FragmentLink<FragmentState>({
  to,
  children,
  Context,
}: {
  to: FragmentState;
  children: ReactNode;
  Context: Context<null | FragmentContext<FragmentState>>;
}) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error("Cannot render FragmentLink outside of a FragmentContext");
  const { stringifyFragment, navigateFragment } = fragmentContext;
  return (
    <a
      style={{ textDecoration: "none" }}
      href={`?_${stringifyFragment(to)}`}
      onClick={(e) => {
        e.preventDefault();
        navigateFragment(to);
      }}
    >
      {children}
    </a>
  );
}

export function useFragmentNavigationController<FragmentState>(
  stringifyFragment: (feature: FragmentState) => string,
  parseFragment: (fragment: string) => FragmentState | null
): readonly [FragmentState | null, string, FragmentContext<FragmentState>] {
  const { push, pathname, query } = useRouter();
  const fragmentString = query._ === undefined ? "" : String(query._);
  const fragment = useMemo(
    () => parseFragment(fragmentString),
    [parseFragment, fragmentString]
  );
  const fragmentContext = useMemo(
    () => ({
      parseFragment,
      stringifyFragment,
      navigateFragment: (to: FragmentState) => {
        push({
          pathname,
          query: { ...query, _: stringifyFragment(to) },
        });
      },
      fragment,
      fragmentString,
    }),
    [parseFragment, fragment, stringifyFragment]
  );
  return [fragment, fragmentString, fragmentContext] as const;
}
