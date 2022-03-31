import { createZContainer, createZService } from "@zerve/core";
import ObsWebSocket from "obs-websocket-js";

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

export async function switchScene() {
  const obs = await getObs();
  console.log("lets go?!");
  // const { scenes } = await obs.send("GetSceneList");
  obs.send("SetCurrentScene", { "scene-name": "Camera" });
  // console.log("lol scenes", scenes);
}

const createOBS = createZService(async () => {
  // const state = createZState()
  return {
    stop: async () => {},
    z: createZContainer({
      // state,
    }),
  };
});

export default createOBS;
