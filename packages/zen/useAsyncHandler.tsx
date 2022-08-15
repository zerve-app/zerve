import { useState } from "react";

export function useAsyncHandler<V, E>(
  handler: (v: V) => Promise<void>
): { error: null | E; isLoading: boolean; handle: (value: V) => void } {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  function handle(value: V) {
    setIsLoading(true);
    setError(null);
    handler(value)
      .then(() => {})
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return { error, isLoading, handle };
}
