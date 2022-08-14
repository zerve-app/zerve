import { useEffect, useState } from "react";

export function useIsMounted() {
  // this is used to verify we are on the browser, to avoid nextjs hydration issues
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
}
