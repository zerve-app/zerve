import { SiteConfig } from "../app/SiteConfig";

export type WebPathRootServerProps = {
  config: SiteConfig;
};

export function getWebRootServerProps(): { props: WebPathRootServerProps } {
  const config: SiteConfig = {
    origin: process.env.Z_ORIGIN || `http://localhost:3888`,
  };
  return {
    props: {
      config,
    },
  };
}
