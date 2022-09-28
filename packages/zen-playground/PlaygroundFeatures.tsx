import { HomePlayground } from "./Home";
import { ButtonPlayground } from "./Button";
import { SpinnerPlayground } from "./Spinner";
import { ToastPlayground } from "./Toast";
import { InputPlayground } from "./Input";
import { NoticePlayground } from "./Notice";
import { ModalPlayground } from "./Modal";
import { ActionButtonSheetPlayground } from "./ActionButtonSheet";
import { DropdownPlayground } from "./Dropdown";
import { IconsPlayground } from "./Icons";
import { ComponentProps, FC } from "react";
import { Icon } from "@zerve/zen/Icon";

export type PlaygroundFeature = {
  title: string;
  name: string;
  icon: ComponentProps<typeof Icon>["name"];
  Feature: FC;
};

export const PlaygroundFeatures = [
  HomePlayground,
  ButtonPlayground,
  SpinnerPlayground,
  ToastPlayground,
  InputPlayground,
  NoticePlayground,
  ModalPlayground,
  ActionButtonSheetPlayground,
  DropdownPlayground,
  IconsPlayground,
] as const;
