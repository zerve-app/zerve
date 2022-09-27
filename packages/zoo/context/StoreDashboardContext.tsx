import { ComponentProps, createContext } from "react";
import { Icon } from "@zerve/zen/Icon";
import { NavFeatureLink, NavLinkButton } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type StoreFeatureProps = {
  title: string;
  storePath: Array<string>;
  onStoreDelete: () => void;
  onStoreRename: (newName: string) => void;
  icon: null | ComponentProps<typeof Icon>["name"];
  onBack?: () => void;
  isActive: boolean;
};

export type StoreNavigationState =
  | {
      key: "entries";
      child?: "create" | "schema";
      entryName?: string;
      path?: Array<string>;
    }
  | {
      key: "schemas";
      child?: "create";
      schema?: string;
      path?: Array<string>;
    }
  | {
      key: "settings";
    };

export function StoreFeatureLink(
  props: Omit<
    ComponentProps<typeof NavFeatureLink<StoreNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavFeatureLink<StoreNavigationState>
      Context={StoreDashboardContext}
      {...props}
    />
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
