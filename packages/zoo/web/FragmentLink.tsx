import { FragmentLinkProps } from "./Fragment";

export function FragmentLink<FragmentState>({
  children,
}: FragmentLinkProps<FragmentState>) {
  // This component is not used in native apps
  // You should always wrap this component with a button or pressable that handles the navigation behavior for native.

  // see FragmentLink.web.tsx for the component that renders an "a" tag
  return <>{children}</>;
}
