import { readFileSync } from "fs-extra";

const buildInfoData = readFileSync("../../build.json", { encoding: "utf-8" });
const buildInfoJSON = JSON.parse(buildInfoData);

export default async function buildInfo(req, res) {
  res.status(200).json(buildInfoJSON);
}
