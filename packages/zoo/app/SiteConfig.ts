import { SavedSession } from "@zerve/zoo-client/Connection";

export type SiteConfig = {
  name?: string;
  origin: string;
  session: null | SavedSession;
};
