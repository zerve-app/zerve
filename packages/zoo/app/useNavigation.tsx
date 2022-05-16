import { useMemo } from "react";
import { useRouter } from "next/router";

export function useNavigation() {
  const { push, back } = useRouter();
  return useMemo(
    () => ({
      navigate: (routeName: string, params: {}) => {
        if (routeName === "File") {
          const path = `${params.storePath.join("/")}/$files/${params.name}`;
          push(path);
          return;
        }

        console.error("Navigate not implemented here!", args);
      },
      dispatch: (action) => {
        const { payload, type } = action;
        if (type === "PUSH" && payload.name === "ZNode") {
          const path = `/${payload.params.path.join("/")}`;
          console.log("will go to:", path);
          push(path);
          return;
        }
        console.error("Dispatch not implemented here!", args);
      },
      canGoBack: () => true,
      goBack: () => {
        back();
      },
    }),
    [push]
  );
}
