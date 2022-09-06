import { SavedSession, serverGet } from "@zerve/zoo-client/Connection";
import { extractSessionAuth } from "@zerve/zoo-client/ServerCalls";
import { UnauthorizedError } from "@zerve/zed";
import { SiteConfig } from "../app/SiteConfig";

export type WebPathRootServerProps = {
  config: SiteConfig;
};

export async function validateUserCanAccessOrg(
  config: SiteConfig,
  orgId: string,
) {
  try {
    const userRoleInOrg = await serverGet(
      config.origin,
      `.z/auth/user/orgs/${orgId}/role`,
      undefined,
      extractSessionAuth(["auth"], config.session),
    );
    // console.log("Users role is", userRoleInOrg);
    return true;
  } catch (e) {
    return false;
  }
}

export async function verifyStoreExists(
  config: SiteConfig,
  entityId: string,
  storeId: string,
  entityIsOrg: boolean,
): Promise<boolean> {
  if (!config.session)
    throw new Error("No user session, cannot verifyStoreExists");
  const userId = config.session.userId;
  if (!entityIsOrg && userId !== entityId) {
    throw new Error(
      "Cannot verifyStoreExists because userId does not match requested entityId",
    );
  }
  const storePath = entityIsOrg
    ? `.z/auth/user/orgs/${entityId}/stores/${storeId}`
    : `.z/auth/user/stores/${storeId}`;
  try {
    const storeStuff = await serverGet(
      config.origin,
      storePath,
      undefined,
      extractSessionAuth(["auth"], config.session),
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function validateSession(origin: string, session: SavedSession | null) {
  if (!session) return null;
  try {
    const userNode = await serverGet(
      origin,
      ".z/auth/user",
      undefined,
      extractSessionAuth(["auth"], session),
    );
    if (userNode && userNode !== UnauthorizedError) return session;
  } catch (e) {
    return null;
  }
  return null;
}

export async function getSiteConfig(context) {
  const sessionUntrusted = getCookieSession(context.req.headers.cookie);
  const origin = process.env.Z_ORIGIN || `http://localhost:3888`;
  const session = await validateSession(origin, sessionUntrusted);
  const config: SiteConfig = {
    origin,
    session,
  };
  return config;
}

function getCookieSession(
  cookieValue: string | undefined,
): SavedSession | null {
  if (!cookieValue) return null;
  const value = getCookie(cookieValue, "ZSession");
  if (value) return JSON.parse(value);
  return null;
}

function getCookie(cookieValue: string, name: string): string | null {
  var nameEQ = name + "=";
  var ca = cookieValue.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export async function getWebRootServerProps(context): Promise<{
  props: WebPathRootServerProps;
}> {
  return {
    props: {
      config: await getSiteConfig(context),
    },
  };
}
