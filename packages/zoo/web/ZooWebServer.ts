import { SavedSession } from "@zerve/client/Connection";
import { SiteConfig } from "../app/SiteConfig";

export type WebPathRootServerProps = {
  config: SiteConfig;
};

export async function getSiteConfig(context) {
  const session = getCookieSession(context.req.headers.cookie);
  const config: SiteConfig = {
    origin: process.env.Z_ORIGIN || `http://localhost:3888`,
    session,
  };
  return config;
}

function getCookieSession(
  cookieValue: string | undefined
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
