import { ReactNode } from "react";
import { StoreNavigationState } from "../context/StoreDashboardContext";

export function StoreNavigationProvider({}: {
  connection: string | null;
  storePath: string[];
  children: ReactNode;
  feature: StoreNavigationState;
}) {
  // this component is not used on web. go see StoreNavigationProvider.native
  return null;
}
