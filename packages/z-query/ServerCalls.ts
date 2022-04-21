import { SavedSession } from ".";
import {
  serverGet,
  serverPost,
  SavedConnection,
  Connection,
} from "./Connection";

export async function listDocs(context: SavedConnection) {
  return await serverGet(context, `.z`);
}

export async function getDoc(context: SavedConnection, name: string) {
  return await serverGet(context, `.z/${name}`);
}

export function pathStartsWith(wholePath: string[], maybePrefixPath: string[]) {
  for (let i in maybePrefixPath) {
    const shouldMatch = maybePrefixPath[i];
    if (wholePath[i] !== shouldMatch) return false;
  }
  return true;
}

function extractSessionAuth(path: string[], session?: null | SavedSession) {
  let auth: null | [string, string] = null;
  if (session && pathStartsWith(path, session.authPath)) {
    const { sessionToken, sessionId, authenticatorId } = session;
    if (sessionToken) {
      auth = [authenticatorId, `${sessionId}.${sessionToken}`];
    }
  }
  return auth;
}

export async function getZ(
  context: SavedConnection,
  path: string[],
  connection?: Connection | undefined
) {
  const query: Record<string, string> = {};
  const connectedClientId = connection?.clientId.get();
  if (connectedClientId) {
    query.zClientSubscribe = connectedClientId;
  }
  const auth = extractSessionAuth(path, context?.session);
  const resp = await serverGet(context, `.z/${path.join("/")}`, query, auth);
  return resp;
}

export async function postZAction(
  context: SavedConnection,
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
    finalBody = { _$RAW_VALUE: body };
  }
  const auth = extractSessionAuth(path, context?.session);
  return await serverPost(context, `.z/${path.join("/")}`, finalBody, auth);
}

export async function getTypedZ(
  context: SavedConnection,
  path: string[],
  connection?: Connection | undefined
) {
  const [node, serverZType] = await Promise.all([
    getZ(context, path, connection),
    getZ(context, [...path, ".type"], connection),
  ]);
  const type =
    serverZType?.[".t"] === "AuthContainer" && serverZType.authType
      ? serverZType.authType
      : serverZType;
  return { node, type };
}
export async function getActions(context: SavedConnection, category?: string) {
  if (category) return await serverGet(context, `.z/.action/${category}`);
  return await serverGet(context, `.z/.action`);
}

export async function getModuleList(context: SavedConnection) {
  return await serverGet(context, `.z/.module`);
}
