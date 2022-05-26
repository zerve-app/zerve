import { DripsyProvider as DripsyInternalProvider, makeTheme } from "dripsy";
import { ReactNode } from "react";
import { ModalProvider } from "./Modal";

export function ZenProvider({ children }: { children: ReactNode }) {
  return (
    <DripsyProvider>
      <ModalProvider>{children}</ModalProvider>
    </DripsyProvider>
  );
}

const theme = makeTheme({
  // https://www.dripsy.xyz/usage/theming/create
  text: {
    p: {
      fontSize: 16,
    },
  },
});

function DripsyProvider({ children }: { children: React.ReactNode }) {
  return (
    <DripsyInternalProvider
      theme={theme}
      // this disables SSR, since react-native-web doesn't have support for it (yet)
      ssr
    >
      {children}
    </DripsyInternalProvider>
  );
}
