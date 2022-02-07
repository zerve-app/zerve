import { createApp } from "./src/Server";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;
const overrideAgentDir = process.env.AGENT_DIR;

createApp(port, overrideAgentDir).catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
