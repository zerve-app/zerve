import React, {
  Context,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/router";

export type FragmentContext<FragmentState> = {
  stringifyFragment: (feature: FragmentState) => string;
  parseFragment: (fragment: string) => FragmentState | null;
  navigateFragment: (fragmentState: FragmentState) => void;
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
  const fragment = query._ === undefined ? "" : String(query._);
  const fragmentState = useMemo(
    () => parseFragment(fragment),
    [parseFragment, fragment]
  );
  const fragmentValueRef = useRef(fragment);
  useEffect(() => {
    fragmentValueRef.current = fragment;
  }, [fragment]);
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
      getFragment: () => fragmentValueRef.current,
    }),
    [parseFragment, stringifyFragment]
  );
  return [fragmentState, fragment, fragmentContext] as const;
}
