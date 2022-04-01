import { useEffect } from "react";

const handlers: Map<string, Set<() => void>> = new Map();

export function addKeyboardHandler(
  channel: string,
  handler: () => void
): () => void {
  if (!handlers.has(channel)) {
    handlers.set(channel, new Set());
  }
  const channelHandlers = handlers.get(channel);
  channelHandlers.add(handler);
  return () => {
    channelHandlers.delete(handler);
  };
}

const channels = {
  escape: {
    matchDown: (e: KeyboardEvent) => {
      return e.key === "Escape";
    },
  },
  palette: {
    matchDown: (e: KeyboardEvent) => {
      return e.key === "p" && e.metaKey;
    },
  },
} as const;

function keydownHandler(e) {
  for (let channelId in channels) {
    const matched = channels[channelId].matchDown?.(e);
    if (matched) {
      const channelHandlers = handlers.get(channelId);
      channelHandlers.forEach((handle) => handle());
      e.preventDefault();
    }
  }
}
function keypressHandler(e) {
  for (let channelId in channels) {
    const matched = channels[channelId].matchPress?.(e);
    if (matched) {
      const channelHandlers = handlers.get(channelId);
      channelHandlers.forEach((handle) => handle());
      e.preventDefault();
    }
  }
}
if (global.window) {
  window.addEventListener("keydown", keydownHandler);
  window.addEventListener("keypress", keypressHandler);
}

export function useKeyboardEffect(
  channel: keyof typeof channels,
  handler: () => void
) {
  useEffect(() => addKeyboardHandler(channel, handler), [channel, handler]);
}
