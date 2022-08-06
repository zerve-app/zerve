import { Text, View } from "dripsy";
import React, { useState } from "react";
import { AbsoluteFill, AsyncButton, Button, Spinner } from "@zerve/zen";
import { postZAction } from "@zerve/client/ServerCalls";
import { createStorage } from "@zerve/client-storage/Storage";
import { ConnectionProvider, useConnection } from "@zerve/client/Connection";
import {
  useWebConnection,
  WEB_PRIMARY_CONN,
} from "@zerve/zoo/app/ConnectionStorage";
import { WebPathRootServerProps } from "@zerve/zoo/web/ZooWebServer";
import { useZNodeValue } from "@zerve/client/Query";
const LocalGambitStorage = createStorage({ id: "GambitStore" });

type LocalState = {
  userToken?: string;
  lobbyId?: string;
};

const LocalStateDefault: LocalState = {};

function mutateStorage(mutator: (state: LocalState) => LocalState) {
  LocalGambitStorage.mutateStorage("LocalStore", LocalStateDefault, mutator);
}

function GambitLobby({
  lobbyId,
  onExit,
}: {
  lobbyId: string;
  onExit: () => void;
}) {
  const lobby = useZNodeValue(["Lobbies", lobbyId], {
    onError: (e) => {
      console.log("hiho", e.code);
      if (e.code === "NotFound") onExit();
    },
  });
  const [hasReadied, setHasReadied] = useState(false);
  const { userToken } = LocalGambitStorage.useStored(
    "LocalStore",
    LocalStateDefault
  );
  const conn = useConnection();
  const startedGameId = lobby.data?.startedGameId;
  if (startedGameId)
    return (
      <GambitGame
        gameId={startedGameId}
        userToken={userToken}
        onExit={() => {}}
      />
    );
  if (lobby.isLoading) {
    return <Spinner />;
  }
  return (
    <View sx={{}}>
      <Text>You are in the lobby</Text>
      <Text>{lobby.data?.playerCount} players in the lobby</Text>
      <Text>{lobby.data?.readyCount} players ready.</Text>

      {hasReadied ? (
        <Text>You are ready.</Text>
      ) : (
        <AsyncButton
          title="ReadyUp"
          onPress={async () => {
            await postZAction(conn, ["ReadyUp"], {
              lobbyId,
              userToken,
            });
            setHasReadied(true);
          }}
        />
      )}
    </View>
  );
}

type CellState = [number | "" | "m" | "c", null | number, number]; // BoardCell, null(unowned)|ownerPlayerIndex, cellPopulation

function getBgColor(cell: CellState) {
  if (cell[1] === -1) return "#d6d6d6";
  if (cell[1] === 0) return "#a4a4f5";
  if (cell[1] === 1) return "#f5ada4";
  if (cell[1] === 2) return "#a4f5d7";
  if (cell[1] === 3) return "#f5dfa4";
}

function GameCell({ cell }: { cell: CellState }) {
  return (
    <View
      sx={{
        width: 28,
        height: 28,
        backgroundColor: getBgColor(cell),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cell[0] === "m" && <Text>🗻</Text>}
      {cell[0] === "c" && <Text>🏰</Text>}
      {typeof cell[0] === "number" && <Text>👑</Text>}
      <View sx={{ ...AbsoluteFill }}>
        {cell[2] !== 0 && <Text>{cell[2]}</Text>}
      </View>
    </View>
  );
}

function GambitGame({
  gameId,
  onExit,
}: {
  gameId: string;
  onExit: () => void;
}) {
  const { userToken } = LocalGambitStorage.useStored(
    "LocalStore",
    LocalStateDefault
  );
  const conn = useConnection();
  if (!userToken) throw new Error("userToken not available.");
  const game = useZNodeValue(["Gameplay", `${gameId}-${userToken}`], {
    onError: (e) => {
      console.log("hiho", e.code);
      if (e.code === "NotFound") onExit();
    },
  });
  return (
    <View sx={{}}>
      <Text>Game step: {game.data?.step}</Text>

      <View sx={{}}>
        {game.data?.state.map((row) => (
          <View sx={{ flexDirection: "row" }}>
            {row.map((cell) => (
              <GameCell cell={cell} />
            ))}
          </View>
        ))}
      </View>

      <AsyncButton
        title="Surrender"
        onPress={async () => {
          await postZAction(conn, ["SurrenderGame"], {
            gameId,
            userToken,
          });
        }}
      />
    </View>
  );
}

function GambitApp() {
  const state = LocalGambitStorage.useStored("LocalStore", LocalStateDefault);
  const conn = useConnection();
  if (!conn) return null;
  if (state.lobbyId)
    return (
      <GambitLobby
        lobbyId={state.lobbyId}
        onExit={() => {
          mutateStorage((state) => {
            return {
              ...state,
              lobbyId: null,
            };
          });
        }}
      />
    );
  return <GambitJoin />;
}
function GambitJoin() {
  const conn = useConnection();
  return (
    <View sx={{}}>
      <AsyncButton
        title="Join Game"
        onPress={async () => {
          const joined = await postZAction(conn, ["JoinLobby"], {});
          mutateStorage((state) => {
            return {
              ...state,
              lobbyId: joined.lobbyId,
              userToken: joined.userToken,
            };
          });
        }}
      />
    </View>
  );
}

export default function GambitRoot(props: WebPathRootServerProps) {
  const conn = useWebConnection(props.config);
  return (
    <ConnectionProvider value={conn}>
      <GambitApp />
    </ConnectionProvider>
  );
}
