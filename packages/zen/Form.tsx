import { ReactNode } from "react";

export function Form({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => void;
}) {
  return (
    <form
      style={{ display: "flex", flexDirection: "column" }}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}
