import {
  Action,
  AgentActions,
  DisplayState,
  DisplayStateReducer,
  InitialDisplayState,
  ObservableValue,
} from "agent-core";
import { createJSONBlock } from "agent-crypto";
import { json } from "body-parser";
import express, { Application, Request, Response } from "express";
import ObsWebSocket from "obs-websocket-js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3888;

let connectedObs: null | ObsWebSocket = null;
let obsConnectionPromise: null | Promise<ObsWebSocket> = null;

async function getObs() {
  if (connectedObs) return connectedObs;
  if (obsConnectionPromise) return await obsConnectionPromise;
  obsConnectionPromise = (async () => {
    const obs = new ObsWebSocket();
    await obs.connect({
      address: "localhost:4444",
      password: "PRUjuNz12",
    });
    return obs;
  })();
  return await obsConnectionPromise;
}

async function switchScene() {
  const obs = await getObs();
  console.log("lets go?!");
  // const { scenes } = await obs.send("GetSceneList");
  obs.send("SetCurrentScene", { "scene-name": "Camera" });
  // console.log("lol scenes", scenes);
}

async function getRoot() {
  // const block = await createJSONBlock({
  //   time: Date.now(),
  // });
  await switchScene();
  // console.log(block);
  // console.log(block.hash);

  return {
    response: {
      a: 123,
      // hash: block.hash,
    },
  };
}

async function postAction() {
  return {
    response: {},
  };
}

function createJSONHandler(handler: () => Promise<{ response: any }>) {
  return (req: Request, res: Response) => {
    handler()
      .then(({ response }) => {
        const responseValue = JSON.stringify(response);
        res.status(200).send(responseValue);
      })
      .catch((e) => {
        console.error(e);
        res.status(e.status || 500).send(
          JSON.stringify({
            message: e.message,
          })
        );
      });
  };
}

class HTTPError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
class NotFoundError extends HTTPError {
  constructor(message?: string) {
    super(404, message || "Not Found");
  }
}
class RequestError extends HTTPError {
  constructor(message?: string) {
    super(400, message || "Request Error");
  }
}
class WrongMethodError extends HTTPError {
  constructor(message?: string) {
    super(405, message || "Invalid Method");
  }
}

function attachServerEngine<EngineActions>(engine: Engine<EngineActions>) {
  // async function handleGet() {
  //   return { response: {} };
  // }
  // async function handlePost() {
  //   return { response: {} };
  // }
  // async function handlePut() {
  //   return { response: {} };
  // }
  // async function handleDelete() {
  //   throw new WrongMethodError();
  //   return { response: {} };
  // }

  function attach(app: Application) {
    app.post("/action", json(), (req, res) => {
      console.log("LESTS GO action!!!", req.body);
    });
    app.get("/state/*address", (req, res) => {
      console.log("uhh", req.query);
    });
  }
  return {
    attach,

    // getHandler: createJSONHandler(handleGet),
    // postHandler: createJSONHandler(handlePost),
    // putHandler: createJSONHandler(handlePut),
    // deleteHandler: createJSONHandler(handleDelete),
  };
}

interface StateEngine<EngineState, EngineActions>
  extends Engine<EngineActions> {
  dispatch: <ActionType extends keyof EngineActions>(
    actionType: ActionType,
    payload: EngineActions[ActionType]
  ) => Promise<void>;
}

interface ReadOnlyStateEngine<EngineState>
  extends ObservableValue<EngineState> {}

interface StaticRecordEngine<EngineActions> {
  get: (context: string[]) => any;
  dispatch: <ActionType extends keyof EngineActions>(
    context: string[],
    actionType: ActionType,
    payload: EngineActions[ActionType]
  ) => Promise<void>;
  subscribe: (context: string[], handler: (s: any) => void) => () => void;
}

interface Engine<EngineActions> {
  get: (context: string[]) => any;
  dispatch: <ActionType extends keyof EngineActions>(
    context: string[],
    actionType: ActionType,
    payload: EngineActions[ActionType]
  ) => Promise<void>;
  subscribe: (context: string[], handler: (s: any) => void) => () => void;
}

// type Engine<Actions> =
//   | StateEngine<any, Actions>
//   | ReadOnlyStateEngine<any>
//   | StaticRecordEngine<Actions>;

function createStateEngine<EngineState, EngineActions>(
  initialState: EngineState,
  reducer: <ActionType extends keyof EngineActions>(
    state: EngineState,
    actionType: ActionType,
    actionPayload: EngineActions[ActionType]
  ) => EngineState,
  performEffects?: <ActionType extends keyof EngineActions>(
    actionType: ActionType,
    actionPayload: EngineActions[ActionType],
    newState: EngineState,
    prevState: EngineState
  ) => Promise<void>
): Engine<EngineState, EngineActions> {
  const updateHandlers = new Set<(state: EngineState) => void>();
  let state: EngineState = initialState;

  function get() {
    return state;
  }

  async function dispatch<ActionType extends keyof EngineActions>(
    actionType: ActionType,
    actionPayload: EngineActions[ActionType]
  ) {
    const prevState = state;
    const newState = reducer(prevState, actionType, actionPayload);
    const effects = performEffects?.(
      actionType,
      actionPayload,
      newState,
      prevState
    );
    state = newState;
    await effects;
    updateHandlers.forEach((handler) => handler(newState));
  }

  function subscribe(handler: (s: EngineState) => void): () => void {
    updateHandlers.add(handler);
    return () => {
      updateHandlers.delete(handler);
    };
  }

  return {
    get,
    subscribe,
    dispatch,
  };
}

function createPrivateStateEngine<EngineState>(
  initialState: EngineState
): [(state: EngineState) => void, Engine<EngineState>] {
  const updateHandlers = new Set<(state: EngineState) => void>();
  function subscribe(handler: (s: EngineState) => void): () => void {
    updateHandlers.add(handler);
    return () => {
      updateHandlers.delete(handler);
    };
  }
  let state: EngineState = initialState;
  function setPrivateState(newState: EngineState) {
    state = newState;
    updateHandlers.forEach((handler) => handler(newState));
  }
  function get() {
    return state;
  }

  return [
    setPrivateState,
    {
      get,
      subscribe,
    },
  ];
}

const [setOBSIsConnected, obsIsConnected] = createPrivateStateEngine(false);

function createStaticRecordEngine<
  EngineActions,
  RecordEngines extends Readonly<Record<string, Engine<EngineActions>>>
>(engines: RecordEngines): Engine<EngineActions> {
  async function dispatch<ActionType extends keyof EngineActions>(
    context: string[],
    actionType: ActionType,
    actionPayload: EngineActions[ActionType]
  ) {
    // uh
  }
  function get(context: string[]) {
    const [activeItem, ...restContext] = context;
    console.log("GETTING", context);
    if (engines[activeItem]) return engines[activeItem].get(restContext);
  }
  function subscribe<V>(
    context: string[],
    handler: (s: V) => void
  ): () => void {
    const [activeItem, ...restContext] = context;
    return () => {};
  }
  return {
    dispatch,
    get,
    subscribe,
  };
}

const obs = createStaticRecordEngine({
  isConnected: obsIsConnected,
} as const);

const engine = attachServerEngine<AgentActions>(
  createStaticRecordEngine({
    obs,
    display: createStateEngine<DisplayState, AgentActions>(
      InitialDisplayState,
      DisplayStateReducer
    ),
  } as const)
);

engine.attach(app);

// app.get("/*", createJSONHandler(getRoot));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
