import {
  createZAction,
  createZContainer,
  createZGettable,
  createZService,
  createZState,
  NullSchema,
} from "@zerve/core";
import ObsWebSocket from "obs-websocket-js";

export const ZOBSService = createZService(async () => {
  const obs = new ObsWebSocket();
  try {
    await obs.connect({
      address: "localhost:4444",
      password: "alisehaiulbfwjauss",
    });
  } catch (e) {
    throw new Error("Cannot Connect to OBS on Port 4444");
  }
  const sceneList = await obs.send("GetSceneList");

  const activeScene = createZState(
    {
      enum: sceneList.scenes.map((scene) => scene.name),
    },
    sceneList["current-scene"]
  );
  let lastSceneInOBS = sceneList["current-scene"];
  obs.on("SwitchScenes", (scene) => {
    lastSceneInOBS = scene["scene-name"];
    activeScene.z.set.call(scene["scene-name"]);
  });
  activeScene.z.state.subscribe((newScene: string) => {
    if (newScene !== lastSceneInOBS) {
      obs.send("SetCurrentScene", { "scene-name": newScene });
    }
  });
  const { isRecording, isRecordingPaused } = await obs.send(
    "GetRecordingStatus"
  );
  const recordingStatus = createZState(
    {
      enum: ["recording", "starting", "stopping", "paused", "stopped"],
    } as const,
    isRecording ? (isRecordingPaused ? "paused" : "recording") : "stopped"
  );
  obs.on("RecordingStopping", (s) => {
    recordingStatus.z.set.call("stopping");
  });
  obs.on("RecordingStopped", (s) => {
    recordingStatus.z.set.call("stopped");
  });
  obs.on("RecordingStarting", (s) => {
    recordingStatus.z.set.call("starting");
  });
  obs.on("RecordingStarted", (s) => {
    recordingStatus.z.set.call("recording");
  });
  obs.on("RecordingPaused", (s) => {
    recordingStatus.z.set.call("paused");
  });
  obs.on("RecordingResumed", (s) => {
    recordingStatus.z.set.call("recording");
  });
  return {
    stop: async () => {
      obs.disconnect();
    },
    z: createZContainer({
      // sceneList: createZGettable({} as const, async () => {
      //   return await obs.send("GetSceneList");
      // }),
      // currentScene: createZGettable({} as const, async () => {
      //   return await obs.send("GetCurrentScene");
      // }),
      // recordingStatus: createZGettable({} as const, async () => {
      //   // obs.addListener("RecordingStatus");
      //   return await obs.send("GetRecordingStatus");
      // }),
      activeScene,
      recordingStatus: recordingStatus.z.state,
      // mediaState: createZGettable({} as const, async () => {
      //   // return await obs.send("GetMediaState", {sourceName: });
      //   return null;
      // }),
      startRecording: createZAction(NullSchema, NullSchema, async () => {
        await obs.send("StartRecording");
      }),
      stopRecording: createZAction(NullSchema, NullSchema, async () => {
        await obs.send("StopRecording");
      }),
      pauseRecording: createZAction(NullSchema, NullSchema, async () => {
        await obs.send("PauseRecording");
      }),
      // switchScene: createZAction(
      //   {
      //     title: "SceneName",
      //     type: "string",
      //   } as const,
      //   {} as const,
      //   async () => {
      //     await obs.send("SetCurrentScene", { "scene-name": "Camera" });
      //   }
      // ),
    }),
  };
});
