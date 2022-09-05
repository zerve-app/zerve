// via @nandorojo from the solito starter. See SafeArea.web.ts for detail

import { SafeAreaInsetsContext } from "react-native-safe-area-context";

export const SafeAreaContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => (
  <SafeAreaInsetsContext.Provider
    value={{
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
    }}
  >
    {children}
  </SafeAreaInsetsContext.Provider>
);
