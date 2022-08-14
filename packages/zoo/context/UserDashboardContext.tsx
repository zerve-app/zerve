import { ComponentProps, createContext } from "react";
import { NavLink } from "../web/Dashboard";
import { FragmentContext } from "../web/Fragment";

export type UserFeatureProps = {
  title: string;
  entityId: string;
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
  props: Omit<ComponentProps<typeof NavLink<UserNavigationState>>, "Context">
) {
  return (
    <NavLink<UserNavigationState> Context={UserDashboardContext} {...props} />
  );
}

export const UserDashboardContext =
  createContext<null | FragmentContext<UserNavigationState>>(null);
