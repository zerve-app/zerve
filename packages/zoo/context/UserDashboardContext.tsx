import { Icon } from "@zerve/zen";
import { ComponentProps, createContext } from "react";
import { NavFeatureLink } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type UserFeatureProps = {
  title: string;
  entityId: string;
  isActive: boolean;
  icon: ComponentProps<typeof Icon>["name"] | null;
};

export type UserNavigationState =
  | {
      key: "stores";
      child?: "create";
    }
  | { key: "organizations"; child?: "create" }
  | {
      key: "settings";
      child?: "profile" | "auth";
    };

export function UserFeatureLink(
  props: Omit<
    ComponentProps<typeof NavFeatureLink<UserNavigationState>>,
    "Context"
  >,
) {
  return (
    <NavFeatureLink<UserNavigationState>
      Context={UserDashboardContext}
      {...props}
    />
  );
}

export const UserDashboardContext =
  createContext<null | FragmentContext<UserNavigationState>>(null);
