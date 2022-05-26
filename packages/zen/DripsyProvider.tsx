import { DripsyProvider as DripsyInternalProvider, makeTheme } from "dripsy";

const theme = makeTheme({
  // https://www.dripsy.xyz/usage/theming/create
  text: {
    p: {
      fontSize: 16,
    },
  },
});

export function DripsyProvider({ children }: { children: React.ReactNode }) {
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
