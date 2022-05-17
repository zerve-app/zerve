import { ReactNode } from "react";

export function Form({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => {};
}) {
  return children;
}
