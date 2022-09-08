import { createContext, ReactNode, useContext } from "react";
import { StoreNavigationState } from "../context/StoreDashboardContext";

export type AppLocation = {
  connection: null | string;
  path: string[];
  storeFeature?: StoreNavigationState;
};

const LocationContext = createContext<null | AppLocation>(null);

export function AppLocationProvider({
  children,
  location,
}: {
  children: ReactNode;
  location: AppLocation | null;
}) {
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export function useAppLocation() {
  const ctx = useContext(LocationContext);
  return ctx;
}
