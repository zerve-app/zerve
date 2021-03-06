import {
  serverGet,
  serverPost,
  SavedConnection,
  SavedSession,
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
    const { sessionToken, sessionId, userId } = session;
    if (sessionToken) {
      auth = [userId, `${sessionId}.${sessionToken}`];
    }
  }
  return auth;
}

export async function getZ(connection: Connection, path: string[]) {
  const query: Record<string, string> = {};
  const connectedClientId = connection?.clientId.get();
  if (connectedClientId) {
    query.zClientSubscribe = connectedClientId;
  }
  const auth = extractSessionAuth(path, connection?.session);
  const resp = await serverGet(connection, `.z/${path.join("/")}`, query, auth);
  return resp;
}

export async function postZAction(
  connection: Connection,
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
  const auth = extractSessionAuth(path, connection?.session);
  const serverPath = `.z/${path.join("/")}`;
  return await serverPost(connection, serverPath, finalBody, auth);
}

export async function getTypedZ(connection: Connection, path: string[]) {
  const [node, serverZType] = await Promise.all([
    getZ(connection, path),
    getZ(connection, [...path, ".type"]),
  ]);
  const type =
    serverZType?.[".t"] === "AuthContainer" && serverZType.authType
      ? serverZType.authType
      : serverZType;
  return { node, type };
}
