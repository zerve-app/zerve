type TitleLayoutState = {
  layout: "Title";
  title: string | null;
  subTitle: string | null;
};

type MediaLayoutState = {
  layout: "Media";
  title: string | null;
  subTitle: string | null;
};

export type DisplayState = TitleLayoutState | MediaLayoutState;

export const InitialDisplayState: DisplayState = {
  layout: "Title",
  title: null,
  subTitle: null,
};
type ActionPayloads = {};

export function DisplayStateReducer<ActionType extends keyof ActionPayloads>(
  state: DisplayState,
  actionType: ActionType,
  actionPayload: ActionPayloads[ActionType]
): DisplayState {
  switch (actionType) {
    case "SetTitle":
      return state;
    default:
      return state;
  }
}
