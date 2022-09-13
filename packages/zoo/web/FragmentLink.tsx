import { Pressable } from "react-native";
import { FragmentLinkProps, useFragmentNavigate } from "./Fragment";

export function FragmentLink<FragmentState>({
  children,
  Context,
  to,
  backgroundColor,
}: FragmentLinkProps<FragmentState>) {
  const navigate = useFragmentNavigate(Context);
  // see FragmentLink.web.tsx for the component that renders an "a" tag
  return (
    <Pressable
      style={{ backgroundColor }}
      onPress={() => {
        navigate(to);
      }}
    >
      {children}
    </Pressable>
  );
}
