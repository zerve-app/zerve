import { FeaturePane } from "@zerve/zen/FeaturePane";
import { ComponentProps, memo } from "react";
import { Icon } from "@zerve/zen/Icon";
import { ZLoadedNode } from "../components/ZNode";

export type DashboardZFeatureProps = {
  path: string[];
  title: string;
  icon: ComponentProps<typeof Icon>["name"] | null;
  isActive: boolean;
};

function DashboardZ({ path, title, icon, isActive }: DashboardZFeatureProps) {
  return (
    <FeaturePane title={title} icon={icon} isActive={isActive}>
      <ZLoadedNode path={path} />
    </FeaturePane>
  );
}

export const DashboardZFeature = memo(DashboardZ);
