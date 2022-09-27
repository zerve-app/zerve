import { ComponentProps, createContext } from "react";
import { Icon } from "@zerve/zen/Icon";
import { NavFeatureLink } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type OrgFeatureProps = {
  title: string;
  entityId: string;
  isActive: boolean;
  icon: null | ComponentProps<typeof Icon>["name"];
};

export type OrgNavigationState =
  | {
      key: "stores";
      child?: "create";
    }
  | { key: "members"; child?: "invite" }
  | {
      key: "settings";
      child?: undefined;
    };

export function OrgFeatureLink(
  props: Omit<
    ComponentProps<typeof NavFeatureLink<OrgNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavFeatureLink<OrgNavigationState>
      Context={OrgDashboardContext}
      {...props}
    />
  );
}

export const OrgDashboardContext =
  createContext<null | FragmentContext<OrgNavigationState>>(null);
