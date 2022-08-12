import { SavedSession } from "@zerve/client/Connection";

export type SiteConfig = {
  name?: string;
  origin: string;
  session: null | SavedSession;
};
