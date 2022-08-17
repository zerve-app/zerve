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

export function clearLocalHistoryStorage() {}

export function appendHistory(event: InternalHistoryEvent) {}

export async function appendHistoryAsync(
  event: InternalHistoryEvent,
): Promise<string> {
  return "ok...";
}

export function reportHistoryEvent(title: string, body: string) {}

export async function storeHistoryEvent(
  title: string,
  body: any,
): Promise<string> {
  return "really?";
}

export function useHistoryEvent(eventId: string): null | HistoryEvent {
  return null;
}

export function useHistory(queryCount = 50) {
  return [];
}
