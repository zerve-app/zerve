import { defineKeySource } from "@zerve/core";
import { createNativeStorage } from "@zerve/native";
import { useEffect, useMemo, useState } from "react";

export type InternalHistoryEvent = {
  key: string;
  title: string;
  body: any;
  time: number;
};
export type HistoryEvent = InternalHistoryEvent & {
  id: string;
};

type HistoryBlockLink = {
  historyBlockId: string | null;
};
type HistoryBlock = {
  previous: HistoryBlockLink;
  prevBlockCount: number;
  prevEventCount: number;
  events: InternalHistoryEvent[];
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

let pendingEvents: InternalHistoryEvent[] = [];
let flushFast: number | undefined = undefined;
let flushSlow: number | undefined = undefined;

const getHistoryBlockId = defineKeySource("HistoryBlock");
const getHistoryEventKey = defineKeySource("HistoryEvent");

const flushNotifiers = new Set<(s: string) => void>();

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
    flushNotifiers.forEach((notify) => notify(blockId));
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
    flushNotifiers.forEach((notify) => notify(blockId));
  }
}

export function appendHistory(event: InternalHistoryEvent) {
  pendingEvents.push(event);
  clearTimeout(flushFast);
  flushFast = setTimeout(flushHistory, 16) as any as number;
  if (!flushSlow) {
    flushSlow = setTimeout(flushHistory, 150) as any as number;
  }
}

export async function appendHistoryAsync(
  event: InternalHistoryEvent
): Promise<string> {
  appendHistory(event);
  const blockId = await new Promise<string>((resolve, reject) => {
    function notifyFlush(id: string) {
      flushNotifiers.delete(notifyFlush);
      resolve(id);
    }
    flushNotifiers.add(notifyFlush);
    setTimeout(() => {
      flushNotifiers.delete(notifyFlush);
      reject(new Error("Timed out waiting for history event flush"));
    }, 5000);
  });
  return getHistoryEventId(blockId, event.key);
}

export function reportHistoryEvent(title: string, body: string) {
  appendHistory({ time: Date.now(), title, body, key: getHistoryEventKey() });
}

export async function storeHistoryEvent(
  title: string,
  body: any
): Promise<string> {
  return await appendHistoryAsync({
    time: Date.now(),
    title,
    body,
    key: getHistoryEventKey(),
  });
}

function getHistoryEventId(blockId: string, eventKey: string) {
  return `${blockId}:${eventKey}`;
}

export function useHistoryEvent(eventId: string): null | HistoryEvent {
  const [blockId, eventKey] = eventId.split(":");
  const block = historyStorage
    .getStorageNode(blockId, null as null | HistoryBlock)
    .get();
  const event = block?.events?.find(
    (event: InternalHistoryEvent) => event.key === eventKey
  );
  if (!event) return null;
  return { id: eventId, ...event };
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
      const blockId = walkBlockId;
      const blockNode = historyStorage.getStorageNode(
        blockId,
        null as null | HistoryBlock
      );
      const blockValue = blockNode.get();
      if (blockValue) {
        outputBlocks.push(blockValue);
        walkBlockId = blockValue.previous.historyBlockId;
        blockValue.events.reverse().forEach((event) => {
          outputEvents.push({
            ...event,
            id: getHistoryEventId(blockId, event.key),
          });
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
