import { useState } from "react";

export function useAsyncHandler<V, E>(
  handler: (v: V) => Promise<void>,
): {
  error: null | E;
  isLoading: boolean;
  handle: (value: V) => void;
  reset: () => void;
} {
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
  function reset() {
    setError(null);
  }
  return { error, isLoading, handle, reset };
}
