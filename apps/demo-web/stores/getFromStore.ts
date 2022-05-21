import { getZ } from "@zerve/client/ServerCalls";

export async function getFromStore(fileKey: string) {
  return await getZ({ url: "http://localhost:3888", key: "" }, [
    "Store",
    "State",
    fileKey,
  ]);
}
