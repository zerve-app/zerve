import { ReactNode } from "react";

export function Form({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => void;
}) {
  return <form onSubmit={onSubmit}>{children}</form>;
}
