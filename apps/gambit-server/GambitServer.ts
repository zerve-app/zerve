import { startZedServer } from "@zerve/node";
import {
  BooleanSchema,
  createZAction,
  createZContainer,
  createZGettable,
  createZState,
  NullSchema,
  NumberSchema,
  StringSchema,
  FromSchema,
  createZGroup,
  createZObservable,
  NotFoundError,
} from "@zerve/core";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
  createTestAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { createSystemFiles } from "@zerve/system-files";
import { join } from "path";
import { randomBytes } from "crypto";

const homeDir = process.env.HOME;

const dataDir = process.env.ZERVE_DATA_DIR || `${homeDir}/.gambit-data`;

const listenPort = Number(process.env.PORT) || 9944;

const PublicUserProfileSchema = {
  type: "object",
  properties: {},
  required: ["status"],
  additionalProperties: false,
} as const;
type PublicUserProfile = FromSchema<typeof PublicUserProfileSchema>;

const PublicGameSchema = {
  type: "object",
  properties: {
    status: { enum: ["lobby", "playing", "ended", "abandoned"] },
    lobbyStartTime: { type: "number" },
    gameStartTime: { type: "number" },
    gameEndTime: { type: "number" },
    steps: {
      type: "array",
      items: { type: "array", items: { type: "string" } },
    },
  },
  required: ["status"],
  additionalProperties: false,
} as const;
type PublicGame = FromSchema<typeof PublicGameSchema>;

const JoinedLobbySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    playerCount: { type: "number" },
    readyCount: { type: "number" },
    startedGameId: { oneOf: [{ type: "string" }, { type: "null" }] },
    startedGameTime: { oneOf: [{ type: "number" }, { type: "null" }] },
  },
  required: [
    "id",
    "playerCount",
    "readyCount",
    "startedGameId",
    "startedGameTime",
  ],
  additionalProperties: false,
} as const;
type JoinedLobby = FromSchema<typeof JoinedLobbySchema>;

const GameplayStateSchema = {
  type: "object",
  properties: {
    step: { type: "number" },
    state: {
      type: "array",
      items: {},
    },
  },
  required: ["step"],
  additionalProperties: false,
} as const;
type GameplayState = FromSchema<typeof GameplayStateSchema>;

type UserState = {
  token: string;
  currentLobbyId: null | string;
  currentGameId: null | string;
};

function getToken(bytes = 10) {
  return randomBytes(bytes).toString("hex");
}

type LobbyState = {
  id: string;
  playerIds: string[];
  readyPlayerIds: string[];
  startedGameTime: number | null;
  startedGameId: string | null;
};
type LobbyNotifier = (lobby: LobbyState) => void;

// a step is a list of all moves made by a player.
// a "move" is a string, `p.d.r.c`
// where p= player index (player ids are immutable in a game)
// d = direction [u,d,l,r] Up Down Left Right
// r,c = Row, Column coordinate numbers of cell who is performing the step
type GameStep = Array<string>;

type BoardCell =
  | "" //  empty cell
  | "m" // mountain
  | "c" // city
  | number; // player spawn point

type Board = Array<Array<BoardCell>>;

function createBoard(playerCount: number) {
  const extraBoardSize = (playerCount - 2) * 2;
  const rowCount = 20 + extraBoardSize + Math.floor(Math.random() * 15);
  const colCount = 20 + extraBoardSize + Math.floor(Math.random() * 15);
  const board = new Array(rowCount).fill(null).map(() => {
    return new Array(colCount).fill("");
  });
  const mountainCount = Math.floor((rowCount * colCount) / 5); // roughly 1 in 5
  for (let mountainI = 0; mountainI < mountainCount; mountainI += 1) {
    const randRow = Math.floor(Math.random() * rowCount);
    const randCol = Math.floor(Math.random() * colCount);
    board[randRow][randCol] = "m";
  }
  const cityCount = Math.floor((rowCount * colCount) / 25); // roughly 1 in 25
  for (let cityI = 0; cityI < cityCount; cityI += 1) {
    const randRow = Math.floor(Math.random() * rowCount);
    const randCol = Math.floor(Math.random() * colCount);
    board[randRow][randCol] = "c";
  }
  for (
    let playerSpawnIndex = 0;
    playerSpawnIndex < playerCount;
    playerSpawnIndex += 1
  ) {
    const playerSpawnRow = Math.floor(Math.random() * rowCount);
    const playerSpawnCol = Math.floor(Math.random() * colCount);
    board[playerSpawnRow][playerSpawnCol] = playerSpawnIndex;
  }
  return board;
}

type CellState = [BoardCell, null | number, number]; // BoardCell, null(unowned)|ownerPlayerIndex, cellPopulation

type BoardState = Array<Array<CellState>>;

function createBoardState(board: Board): BoardState {
  return board.map((row, rowI: number) => {
    return row.map((cell: BoardCell, colI: number) => {
      if (typeof cell === "number") return [cell, cell, 1];
      if (cell === "c") return [cell, null, 38 + Math.floor(Math.random() * 6)];
      return [cell, null, 0];
    });
  });
}

type GameState = {
  id: string;
  startedTime: number;
  playerIds: string[];
  board: Board;
  boardState: BoardState;
  surrenderStep: (null | number)[];
  //a game is made of a number of steps
  playerRequests: string[][]; // a step request is `rowIndex.colIndex.direction` where direction is u,d,l,r
  steps: Array<GameStep>;
};
type GameNotifier = (game: GameState) => void;

function createLobby(id: string): LobbyState {
  return {
    id,
    playerIds: [],
    readyPlayerIds: [],
    startedGameId: null,
    startedGameTime: null,
  };
}

const PlayerRequestSchema = {
  type: "object",
  properties: {
    userToke: { type: "string" },
    playerCount: { type: "number" },
    readyCount: { type: "number" },
    startedGameId: { oneOf: [{ type: "string" }, { type: "null" }] },
    startedGameTime: { oneOf: [{ type: "number" }, { type: "null" }] },
  },
  required: [
    "userToken",
    "playerCount",
    "readyCount",
    "startedGameId",
    "startedGameTime",
  ],
  additionalProperties: false,
} as const;
type PlayerRequest = FromSchema<typeof PlayerRequestSchema>;

function computePlayerStep(
  gameState: GameState,
  playerIndex: number,
  stepIndex: number
) {
  const step = gameState.steps[stepIndex];

  // step.push()
}

function computeGameStep(gameState: GameState) {
  gameState.steps.push([]);
  const stepIndex = gameState.steps.length - 1;

  if (stepIndex % KING_PAYOUT_INTERVAL) {
    gameState.boardState.map((rowState) => {
      rowState.map((cellState) => {
        if (typeof cellState[0] === "number") cellState[2] = cellState[2] + 1;
      });
    });
  }
  if (stepIndex % CITY_PAYOUT_INTERVAL) {
    gameState.boardState.map((rowState) => {
      rowState.map((cellState) => {
        if (cellState[0] === "c" && typeof cellState[0] === "number")
          cellState[2] = cellState[2] + 1;
      });
    });
  }
  if (stepIndex % LAND_PAYOUT_INTERVAL) {
    gameState.boardState.map((rowState) => {
      rowState.map((cellState) => {
        if (cellState[0] === "" && typeof cellState[0] === "number")
          cellState[2] = cellState[2] + 1;
      });
    });
  }
  if (stepIndex % 2) {
    for (
      let playerIndex = 0;
      playerIndex < gameState.playerIds.length;
      playerIndex += 1
    ) {
      computePlayerStep(gameState, playerIndex, stepIndex);
    }
  } else {
    for (
      let playerIndex = gameState.playerIds.length - 1;
      playerIndex >= 0;
      playerIndex -= 1
    ) {
      computePlayerStep(gameState, playerIndex, stepIndex);
    }
  }
  // increment the value of kings and cities
  // for each player:

  // interpret the player requests
}

const KING_PAYOUT_INTERVAL = 2;
const CITY_PAYOUT_INTERVAL = 2;
const LAND_PAYOUT_INTERVAL = 50;
const STEP_DURATION_MS = 1000;

export async function startApp() {
  console.log("Starting Data Dir", dataDir);

  const Data = await createCoreData(dataDir);

  const users: Record<string, UserState> = {};

  const activeGames: Record<string, GameState> = {};
  const activeGameNotifiers: Record<string, Set<GameNotifier>> = {};
  let activePublicLobby: string = getToken(3);

  const lobbyNotifiers: Record<string, Set<LobbyNotifier>> = {
    [activePublicLobby]: new Set<LobbyNotifier>(),
  };
  const lobbies: Record<string, LobbyState> = {
    [activePublicLobby]: createLobby(activePublicLobby),
  };

  setInterval(() => {
    Object.values(activeGames).forEach((activeGame) => {
      computeGameStep(activeGame);
      notifyGameUpdate(activeGame);
    });
  }, STEP_DURATION_MS);

  function getNewLobby(): LobbyState {
    const lobbyId = getToken(3);
    if (lobbies[lobbyId]) return getNewLobby();
    const lobby = createLobby(lobbyId);
    lobbies[lobbyId] = lobby;
    lobbyNotifiers[lobbyId] = new Set<LobbyNotifier>();
    return lobby;
  }
  function notifyLobbyUpdate(lobby: LobbyState) {
    const id = lobby.id;
    const notifiers = lobbyNotifiers[id];
    if (!notifiers) throw new Error("cannot notify lobby");
    notifiers.forEach((n) => n(lobby));
  }
  function notifyGameUpdate(game: GameState) {
    const id = game.id;
    const notifiers = activeGameNotifiers[id];
    if (!notifiers) throw new Error("cannot notify game");
    notifiers.forEach((n) => n(game));
  }
  function getUser(prevUserToken: string | undefined): UserState {
    if (prevUserToken && users[prevUserToken]) return users[prevUserToken];
    const token = getToken(40);
    const user: UserState = {
      token,
      currentLobbyId: null,
      currentGameId: null,
    };
    users[token] = user;
    return user;
  }

  function getJoinablePublicLobby(): LobbyState {
    let lobby = lobbies[activePublicLobby];
    if (
      lobby.playerIds.length >= 2 ||
      lobby.startedGameId ||
      lobby.startedGameTime
    ) {
      lobby = getNewLobby();
      activePublicLobby = lobby.id;
    }
    return lobby;
  }

  const zRoot = createZContainer({
    Users: createZGroup(async (gameId) => {
      return createZGettable(PublicUserProfileSchema, async () => {
        return {};
      });
    }),
    Games: createZGroup(async (gameId) => {
      return createZGettable(PublicGameSchema, async () => {
        return { status: "lobby" };
      });
    }),
    GamePlayer: createZGroup(async () => {
      return createZContainer({});
    }),
    Gameplay: createZGroup(async (gameplayKey) => {
      const [gameId, userToken] = gameplayKey.split("-");
      function getGameplay(): GameplayState {
        const gameState = activeGames[gameId];
        if (!gameState) throw new NotFoundError();
        return {
          step: gameState.steps.length,
          state: gameState.boardState,
        };
      }
      return createZObservable(
        GameplayStateSchema,
        getGameplay,
        (handler: (v: GameplayState) => void) => {
          const notifiers = activeGameNotifiers[gameId];
          if (!notifiers) throw new NotFoundError();
          function handleGameplayUpdate() {
            handler(getGameplay());
          }
          notifiers.add(handleGameplayUpdate);
          return () => {
            notifiers.delete(handleGameplayUpdate);
          };
        }
      );
    }),
    Lobbies: createZGroup(async (lobbyId) => {
      function getLobby(): JoinedLobby {
        const lobbyState = lobbies[lobbyId];
        if (!lobbyState) throw new NotFoundError();
        return {
          id: lobbyId,
          playerCount: lobbyState.playerIds.length,
          readyCount: lobbyState.readyPlayerIds.length,
          startedGameTime: lobbyState.startedGameTime,
          startedGameId: lobbyState.startedGameId,
        };
      }
      return createZObservable(
        JoinedLobbySchema,
        getLobby,
        (handler: (v: JoinedLobby) => void) => {
          const notifiers = lobbyNotifiers[lobbyId];
          if (!notifiers) throw new NotFoundError();
          function handleLobbyUpdate() {
            handler(getLobby());
          }
          notifiers.add(handleLobbyUpdate);
          return () => {
            notifiers.delete(handleLobbyUpdate);
          };
        }
      );
    }),
    ReadyUp: createZAction(
      {
        type: "object",
        properties: {
          userToken: {
            description: "Optionally provide a user token",
            type: "string",
          },
          lobbyId: {
            description:
              "The lobby you have already joined and want to ready in",

            type: "string",
          },
        },
        required: ["userToken", "lobbyId"],
        additionalProperties: false,
      } as const,
      NullSchema,
      async ({ userToken, lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) throw new Error("Lobby not found");
        if (lobby.playerIds.indexOf(userToken) === -1)
          throw new Error("User is not in lobby");
        lobby.readyPlayerIds.push(userToken);
        console.log("hlellok?!?", lobby);
        if (
          lobby.readyPlayerIds.length > 1 &&
          lobby.readyPlayerIds.length >= lobby.playerIds.length
        ) {
          console.log("startin.");
          const gameId = getToken(8);
          lobby.startedGameTime = Date.now();
          lobby.startedGameId = gameId;
          notifyLobbyUpdate(lobby);
          const board = createBoard(lobby.playerIds.length);
          activeGames[gameId] = {
            id: gameId,
            startedTime: Date.now(),
            playerIds: lobby.playerIds,
            board,
            surrenderStep: lobby.playerIds.map((_) => null),
            boardState: createBoardState(board),
            steps: [],
          };
          activeGameNotifiers[gameId] = new Set();

          // once the ready count matches player count, we start.
          // const board = createBoard(8);
          // console.log(board);
        } else {
          notifyLobbyUpdate(lobby);
        }
      }
    ),
    SurrenderGame: createZAction(
      {
        type: "object",
        properties: {
          userToken: {
            type: "string",
          },
          gameId: {
            type: "string",
          },
        },
        required: [],
        additionalProperties: false,
      } as const,
      NullSchema,
      async ({ userToken, gameId }) => {
        const game = activeGames[gameId];
        if (!game) throw new Error("game not here");
        const playerIndex = game.playerIds.indexOf(userToken);
        if (playerIndex === -1) throw new Error("player not in game");
        game.surrenderStep[playerIndex] = game.steps.length;
        for (let stateRow in game.boardState) {
          for (let stateCell in stateRow) {
            if (stateCell[0] === playerIndex) stateCell[0] = "c";
            if (stateCell[1] === playerIndex) stateCell[1] = -1;
          }
        }
        return null;
      }
    ),
    SetGameSteps: createZAction(
      {
        type: "object",
        properties: {
          userToken: {
            type: "string",
          },
          gameId: {
            type: "string",
          },
          requestSteps: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: [],
        additionalProperties: false,
      } as const,
      NullSchema,
      async ({ userToken, gameId, requestSteps }) => {
        const game = activeGames[gameId];
        if (!game) throw new Error("game not here");
        const playerIndex = game.playerIds.indexOf(userToken);
        if (playerIndex === -1) throw new Error("player not in game");
        game.playerRequests[playerIndex] = requestSteps;

        console.log("REQUESTgamesteps", userToken, gameId, requestSteps);
        return null;
      }
    ),
    JoinLobby: createZAction(
      {
        type: "object",
        properties: {
          userToken: {
            description: "Optionally provide a user token",
            type: "string",
          },
          lobbyId: {
            description:
              "Optionally provide a lobby ID if you know which you want to join",

            type: "string",
          },
        },
        required: [],
        additionalProperties: false,
      } as const,
      {
        type: "object",
        properties: {
          userToken: {
            description:
              "The secret user token that can be used to make actions in the lobby and games",
            type: "string",
          },
          lobbyId: { type: "string" },
        },
        required: ["lobbyId"],
        additionalProperties: false,
      } as const,
      async ({ userToken, lobbyId }) => {
        const user = getUser(userToken);
        if (user.currentLobbyId || user.currentGameId) {
          throw new Error("User is already in a lobby");
        }
        if (lobbyId) {
          throw new Error("specifying lbboy id not supported yet");
        }

        const lobby = getJoinablePublicLobby();
        lobby.playerIds.push(user.token);
        notifyLobbyUpdate(lobby);
        user.currentLobbyId = lobby.id;

        return {
          userToken: user.token,
          lobbyId: lobby.id,
        };
      }
    ),
  });

  await startZedServer(listenPort, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
