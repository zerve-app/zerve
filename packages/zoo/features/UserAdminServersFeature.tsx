import { memo } from "react";
import {
  UserFeatureLink,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { NavLinkContentGroup } from "@zerve/zen/NavLink";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { StoreEntriesFeature } from "./StoreEntriesFeature";

export function UserAdminServersFeature(props: UserFeatureProps) {
  return null;
  return (
    <StoreEntriesFeature
      {...props}
      storePath={[]}
      onStoreDelete={() => {}}
      onStoreRename={() => {}}
    />
  );
}
