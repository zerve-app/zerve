import { ComponentProps, createContext } from "react";
import { NavLink } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type StoreFeatureProps = {
  title: string;
  storePath: Array<string>;
};

export type StoreNavigationState =
  | {
      key: "entries";
      path?: Array<string>;
      child?: "create";
    }
  | { key: "schemas"; schema?: string; child?: "create" }
  | {
      key: "settings";
    };

export function StoreFeatureLink(
  props: Omit<ComponentProps<typeof NavLink<StoreNavigationState>>, "Context">
) {
  return (
    <NavLink<StoreNavigationState> Context={StoreDashboardContext} {...props} />
  );
}

export const StoreDashboardContext =
  createContext<null | FragmentContext<StoreNavigationState>>(null);
