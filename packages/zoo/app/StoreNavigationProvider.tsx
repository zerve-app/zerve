import { ReactNode, useMemo } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { FragmentContext } from "../web/Fragment";

export function StoreNavigationProvider({
  connection,
  storePath,
  children,
}: {
  connection: string | null;
  storePath: string[];
  children: ReactNode;
}) {
  // this component is not used on web. go see StoreNavigationProvider.native
  return null;
}
