import { useMemo } from "react";
import { useRouter } from "next/router";

export function useNavigation() {
  const { push, back } = useRouter();
  return useMemo(
    () => ({
      navigate: (routeName: string, params: {}) => {
        if (routeName === "File") {
          const path = `/${params.storePath.join("/")}/$files/${params.name}`;
          push(path);
        } else if (routeName === "NewFile") {
          push(`/${params.storePath.join("/")}/$new-file`);
        } else if (routeName === "StoreHistory") {
          push(`/${params.storePath.join("/")}/$history`);
        } else if (routeName === "StoreSchemas") {
          push(`/${params.storePath.join("/")}/$schemas`);
        } else if (routeName === "StoreSchema") {
          debugger;
          push(`/${params.storePath.join("/")}/$schemas`);
        } else {
          console.error("Navigate not implemented here!", routeName, params);
        }
      },
      dispatch: (action) => {
        const { payload, type } = action;
        if (type === "PUSH" && payload.name === "ZNode") {
          const path = `/${payload.params.path.join("/")}`;
          push(path);
        } else if (type === "BACK") {
          back();
        } else {
          console.error("Dispatch not implemented here!", action);
        }
      },
      canGoBack: () => true,
      goBack: () => {
        back();
      },
    }),
    [push]
  );
}
