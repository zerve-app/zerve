import { useMemo } from "react";
import { useRouter } from "next/router";

export function useNavigation() {
  const { push } = useRouter();
  return useMemo(
    () => ({
      navigate: (...args) => {
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
    }),
    [push]
  );
}
