import { Icon } from "@zerve/ui/Icon";
import { ComponentProps } from "react";

export function getZIcon(type: string): ComponentProps<typeof Icon>["name"] {
  if (type === "Container") return "list-ul";
  if (type === "Gettable") return "download";
  if (type === "Group") return "folder";
  if (type === "Action") return "play";
  if (type === "Static") return "file";
  if (type === "Observable") return "binoculars";
  return "folder";
}
