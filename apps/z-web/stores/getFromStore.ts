import { getZ } from "@zerve/query";

export async function getFromStore(fileKey: string) {
  try {
    return await getZ({ url: "http://localhost:3888", key: "" }, [
      "Store",
      "State",
      fileKey,
    ]);
  } catch (e) {
    // FIX FIX FIX
    return {};
  }
}
