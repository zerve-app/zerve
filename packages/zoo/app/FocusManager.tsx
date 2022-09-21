// no-op on web
// see FocusManager.tsx

export function initFocusManager() {
  throw new Error(
    "FocusManager initFocusManager not implemented on web. ReactQuery handles this internally",
  );
}
