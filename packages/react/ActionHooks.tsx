import { useEffect } from "react";

export function useAction(actionKey: any) {
  useEffect(() => {
    console.log("hello");
  }, []);
  return (payload: any) => {
    console.log("Pog action!", actionKey, payload);
  };
}
