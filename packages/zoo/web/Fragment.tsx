import React, {
  Context,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/router";

export type FragmentContext<FragmentState> = {
  stringifyFragment: (feature: FragmentState) => string;
  parseFragment: (fragment: string) => FragmentState | null;
  navigateFragment: (
    fragmentState: FragmentState,
    shouldReplace?: boolean,
  ) => void;
  fragment: FragmentState | null;
  fragmentString: string;
};

export function useFragmentNavigate<FragmentState>(
  Context: Context<FragmentContext<FragmentState> | null>,
) {
  const fragmentContext = useContext(Context);
  if (!fragmentContext)
    throw new Error(
      "Cannot useFragmentNavigate outside the valid FragmentContext",
    );
  return useCallback(
    (feature: FragmentState, shouldReplace?: boolean) => {
      fragmentContext.navigateFragment(feature, shouldReplace);
    },
    [fragmentContext.navigateFragment],
  );
}

export type FragmentLinkProps<FragmentState> = {
  to: FragmentState;
  children: ReactNode;
  Context: Context<null | FragmentContext<FragmentState>>;
};

export function useFragmentNavigationController<FragmentState>(
  stringifyFragment: (feature: FragmentState) => string,
  parseFragment: (fragment: string) => FragmentState | null,
  onFeature?: (fragment: FragmentState | null, fragmentString: string) => void,
  onIntercept?: (
    fragment: FragmentState,
    navigateFeature: (f: FragmentState) => void,
  ) => boolean,
): readonly [FragmentState | null, string, FragmentContext<FragmentState>] {
  const { push, replace, pathname, query } = useRouter();
  const fragmentString = query._ === undefined ? "" : String(query._);
  const fragment = useMemo(
    () => parseFragment(fragmentString),
    [parseFragment, fragmentString],
  );
  function navigateFragment(to: FragmentState, shouldReplace?: boolean) {
    const shouldAllow = !onIntercept || onIntercept?.(to, navigateFragment);
    if (!shouldAllow) return;
    const navAct = shouldReplace ? replace : push;
    navAct({
      pathname,
      query: { ...query, _: stringifyFragment(to) },
    });
  }
  const fragmentContext = useMemo(
    () => ({
      parseFragment,
      stringifyFragment,
      navigateFragment,
      fragment,
      fragmentString,
    }),
    [parseFragment, fragment, stringifyFragment],
  );
  useEffect(() => {
    onFeature?.(fragment, fragmentString);
  }, [fragment, fragmentString]);
  return [fragment, fragmentString, fragmentContext] as const;
}
