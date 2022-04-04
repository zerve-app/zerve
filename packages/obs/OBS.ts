import {
  createZAction,
  createZContainer,
  createZGettable,
  createZService,
  createZState,
} from "@zerve/core";
import ObsWebSocket from "obs-websocket-js";

export const ZOBSService = createZService(async () => {
  const obs = new ObsWebSocket();
  await obs.connect({
    address: "localhost:4444",
    password: "alisehaiulbfwjauss",
  });
  // obs.on("SwitchScenes", (scene) => {});
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
    recordingStatus.set("stopping");
  });
  obs.on("RecordingStopped", (s) => {
    recordingStatus.set("stopped");
  });
  obs.on("RecordingStarting", (s) => {
    recordingStatus.set("starting");
  });
  obs.on("RecordingStarted", (s) => {
    recordingStatus.set("recording");
  });
  obs.on("RecordingPaused", (s) => {
    recordingStatus.set("paused");
  });
  obs.on("RecordingResumed", (s) => {
    recordingStatus.set("recording");
  });
  return {
    stop: async () => {
      obs.disconnect();
    },
    z: createZContainer({
      sceneList: createZGettable({} as const, async () => {
        return await obs.send("GetSceneList");
      }),
      currentScene: createZGettable({} as const, async () => {
        return await obs.send("GetCurrentScene");
      }),
      // recordingStatus: createZGettable({} as const, async () => {
      //   // obs.addListener("RecordingStatus");
      //   return await obs.send("GetRecordingStatus");
      // }),
      recordingStatus: recordingStatus.state,
      mediaState: createZGettable({} as const, async () => {
        // return await obs.send("GetMediaState", {sourceName: });
      }),
      startRecording: createZAction({} as const, {} as const, async () => {
        await obs.send("StartRecording");
      }),
      stopRecording: createZAction({} as const, {} as const, async () => {
        await obs.send("StopRecording");
      }),
      pauseRecording: createZAction({} as const, {} as const, async () => {
        await obs.send("PauseRecording");
      }),
      switchScene: createZAction(
        {
          title: "SceneName",
          type: "string",
        } as const,
        {} as const,
        async () => {
          await obs.send("SetCurrentScene", { "scene-name": "Camera" });
        }
      ),
    }),
  };
});
