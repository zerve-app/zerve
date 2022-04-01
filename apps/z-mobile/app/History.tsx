import { defineKeySource } from "@zerve/core";
import { createNativeStorage } from "@zerve/native";
import { useEffect, useMemo, useState } from "react";

export type HistoryEvent = {
  key: string;
  title: string;
  body: string;
  time: number;
};

type HistoryBlockLink = {
  historyBlockId: string | null;
};
type HistoryBlock = {
  previous: HistoryBlockLink;
  prevBlockCount: number;
  prevEventCount: number;
  events: HistoryEvent[];
};

const defaultHistoryBlockLink: HistoryBlockLink = {
  historyBlockId: null,
};
const historyStorage = createNativeStorage({
  id: "History",
});
const latestHistoryBlockLink = historyStorage.getStorageNode(
  "LatestBlockLink",
  defaultHistoryBlockLink
);

export function clearLocalHistoryStorage() {
  latestHistoryBlockLink.set({ historyBlockId: null });
  historyStorage.dangerouslyClearAllStorage();
}

let pendingEvents: HistoryEvent[] = [];
let flushFast: number | undefined = undefined;
let flushSlow: number | undefined = undefined;

const getHistoryBlockId = defineKeySource("HistoryBlock");
const getHistoryEventId = defineKeySource("HistoryEvent");

function flushHistory() {
  clearTimeout(flushFast);
  flushFast = undefined;
  clearTimeout(flushSlow);
  flushSlow = undefined;
  const eventsToFlush = pendingEvents;
  pendingEvents = [];
  const previousLink = latestHistoryBlockLink.get();
  if (previousLink.historyBlockId) {
    const previousBlockNode = historyStorage.getStorageNode(
      previousLink.historyBlockId,
      null as null | HistoryBlock
    );
    const previousBlock = previousBlockNode.get();

    if (previousBlock === null)
      throw new Error("Failed to look up latest history block");

    const blockId = getHistoryBlockId();
    const blockNode = historyStorage.getStorageNode(
      blockId,
      null as null | HistoryBlock
    );
    blockNode.set({
      events: eventsToFlush,
      previous: previousLink,
      prevBlockCount: previousBlock.prevBlockCount + 1,
      prevEventCount:
        previousBlock.prevEventCount + previousBlock.events.length,
    });
    latestHistoryBlockLink.set({
      historyBlockId: blockId,
    });
  } else {
    const blockId = getHistoryBlockId();
    const blockNode = historyStorage.getStorageNode(
      blockId,
      null as null | HistoryBlock
    );
    blockNode.set({
      events: eventsToFlush,
      previous: { historyBlockId: null },
      prevBlockCount: 0,
      prevEventCount: 0,
    });
    latestHistoryBlockLink.set({
      historyBlockId: blockId,
    });
  }
}

export function appendHistory(event: HistoryEvent) {
  pendingEvents.push(event);
  clearTimeout(flushFast);
  flushFast = setTimeout(flushHistory, 16) as any as number;
  if (!flushSlow) {
    flushSlow = setTimeout(flushHistory, 150) as any as number;
  }
}

export function reportHistoryEvent(title: string, body: string) {
  appendHistory({ time: Date.now(), title, body, key: getHistoryEventId() });
}

export function useHistory(queryCount = 50) {
  const [blockLink, setBlockLink] = useState(latestHistoryBlockLink.get());
  useEffect(() => {
    function handleUpdate() {
      setBlockLink(latestHistoryBlockLink.get());
    }
    latestHistoryBlockLink.updateHandlers.add(handleUpdate);
    return () => {
      latestHistoryBlockLink.updateHandlers.delete(handleUpdate);
    };
  }, []);
  const events = useMemo(() => {
    const outputEvents: HistoryEvent[] = [];
    const outputBlocks: HistoryBlock[] = [];
    let walkBlockId = blockLink.historyBlockId;
    let walkEventCount = 0;
    while (walkBlockId && walkEventCount < queryCount) {
      const blockNode = historyStorage.getStorageNode(
        walkBlockId,
        null as null | HistoryBlock
      );
      const blockValue = blockNode.get();
      if (blockValue) {
        outputBlocks.push(blockValue);
        walkBlockId = blockValue.previous.historyBlockId;
        blockValue.events.reverse().forEach((event) => {
          outputEvents.push(event);
        });
        walkEventCount += blockValue.events.length;
      } else {
        walkBlockId = null;
      }
    }
    return outputEvents;
  }, [blockLink.historyBlockId]);

  return events;
}
