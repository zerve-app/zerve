import { ComponentProps, createContext, useContext } from "react";
import { NavLink, NavLinkButton } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type StoreFeatureProps = {
  title: string;
  storeId: string;
  storePath: Array<string>;
  location: Array<string>;
};

export type StoreNavigationState =
  | {
      key: "entries";
      path?: Array<string>;
      child?: "create" | "schema";
    }
  | { key: "schemas"; schema?: string; child?: "create" }
  | {
      key: "settings";
    };

export function StoreFeatureLink(
  props: Omit<ComponentProps<typeof NavLink<StoreNavigationState>>, "Context">,
) {
  return (
    <NavLink<StoreNavigationState> Context={StoreDashboardContext} {...props} />
  );
}

export function StoreFeatureLinkButton(
  props: Omit<
    ComponentProps<typeof NavLinkButton<StoreNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavLinkButton<StoreNavigationState>
      Context={StoreDashboardContext}
      {...props}
    />
  );
}

export const StoreDashboardContext =
  createContext<null | FragmentContext<StoreNavigationState>>(null);

export type UnsavedEnvironment = {
  claimDirty: () => void;
  releaseDirty: () => void;
};
export const UnsavedContext = createContext<null | UnsavedEnvironment>(null);

export function useUnsavedContext() {
  const ctx = useContext(UnsavedContext);
  if (!ctx)
    throw new Error(
      "Must use this feature within an UnsavedContext Environment ",
    );
  return ctx;
}
