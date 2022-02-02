import { AgentActions } from ".";

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

export function DisplayStateReducer<ActionType extends keyof AgentActions>(
  state: DisplayState,
  actionType: ActionType,
  actionPayload: AgentActions[ActionType]
): DisplayState {
  switch (actionType) {
    case "SetTitle":
      return state;
    default:
      return state;
  }
}
