import { serverGet, serverPost, QueryContext } from "./Connection";

export async function serverAction<Action, Response>(
  context: QueryContext,
  action: Action
): Promise<Response> {
  return await serverPost(context, ".z/.action", action);
}

export async function listDocs(context: QueryContext) {
  return await serverGet(context, `.z`);
}

export async function getDoc(context: QueryContext, name: string) {
  return await serverGet(context, `.z/${name}`);
}

export async function getZ(context: QueryContext, path: string[]) {
  return await serverGet(context, `.z/${path.join("/")}`);
}

export async function postZAction(
  context: QueryContext,
  path: string[],
  body: any
) {
  console.log("aayo", { context, body, path });
  return await serverPost(context, `.z/${path.join("/")}`, body);
}

export async function getTypedZ(context: QueryContext, path: string[]) {
  const [node, type] = await Promise.all([
    getZ(context, path),
    getZ(context, [...path, ".type"]),
  ]);
  return { node, type };
}
export async function getActions(context: QueryContext, category?: string) {
  if (category) return await serverGet(context, `.z/.action/${category}`);
  return await serverGet(context, `.z/.action`);
}

export async function getModuleList(context: QueryContext) {
  return await serverGet(context, `.z/.module`);
}
