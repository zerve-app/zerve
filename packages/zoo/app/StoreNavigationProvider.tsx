import { ReactNode } from "react";
import { StoreNavigationState } from "../context/StoreDashboardContext";

export function StoreNavigationProvider({}: {
  connection: string | null;
  storePath: string[];
  feature: StoreNavigationState;
  render: (props: { isActive: boolean }) => ReactNode;
}) {
  // this component is not used on web. go see StoreNavigationProvider.native
  return null;
}
