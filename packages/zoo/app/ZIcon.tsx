import { Icon } from "@zerve/zen/Icon";
import { ComponentProps } from "react";

export function getZIcon(z: any): ComponentProps<typeof Icon>["name"] {
  if (z?.[".t"] === "Container") {
    if (z?.meta?.zContract === "State") return "edit";
    if (z?.meta?.zContract === "Store") return "book";
    if (z?.meta?.zContract === "Auth") return "user";
    return "list-ul";
  }
  if (z?.[".t"] === "Gettable") return "download";
  if (z?.[".t"] === "Group") return "folder";
  if (z?.[".t"] === "Action") return "play";
  if (z?.[".t"] === "Static") return "file";
  if (z?.[".t"] === "Observable") return "binoculars";
  return "folder";
}
