import { serverGet, serverPost, Connection, SavedSession } from "./Connection";

export async function listDocs(context: Connection) {
  return await serverGet(context.url, `.z`);
}

export async function getDoc(context: Connection, name: string) {
  return await serverGet(context.url, `.z/${name}`);
}

export function pathStartsWith(wholePath: string[], maybePrefixPath: string[]) {
  for (let i in maybePrefixPath) {
    const shouldMatch = maybePrefixPath[i];
    if (wholePath[i] !== shouldMatch) return false;
  }
  return true;
}

export function extractSessionAuth(
  path: string[],
  session?: null | SavedSession,
) {
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
  const auth = extractSessionAuth(path, connection?.session);
  const resp = await serverGet(
    connection.url,
    `.z/${path.join("/")}`,
    undefined,
    auth,
  );
  return resp;
}

export async function postZAction(
  connection: Connection,
  path: string[],
  body: any,
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
  return await serverPost(connection.url, serverPath, finalBody, auth);
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
