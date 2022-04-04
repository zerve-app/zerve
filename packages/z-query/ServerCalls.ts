import { serverGet, serverPost, QueryContext, Connection } from "./Connection";

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

export async function getZ(
  context: QueryContext,
  path: string[],
  connection?: Connection | undefined
) {
  const query: Record<string, string> = {};
  const connectedClientId = connection?.clientId.get();
  if (connectedClientId) {
    query.zClientSubscribe = connectedClientId;
  }
  return await serverGet(context, `.z/${path.join("/")}`, query);
}

export async function postZAction(
  context: QueryContext,
  path: string[],
  body: any
) {
  let finalBody = body;
  const bodyType = typeof body;
  if (
    body === null ||
    bodyType === "number" ||
    bodyType === "string" ||
    bodyType === "boolean"
  ) {
    // express body-parser is dumber than a sack of bricks, if the value is not an object or an array
    finalBody = { __Z_RAW_VALUE_AND_BODY_PARSER_IS_IGNORANT: body };
  }

  return await serverPost(context, `.z/${path.join("/")}`, finalBody);
}

export async function getTypedZ(
  context: QueryContext,
  path: string[],
  connection?: Connection | undefined
) {
  const [node, type] = await Promise.all([
    getZ(context, path, connection),
    getZ(context, [...path, ".type"], connection),
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
