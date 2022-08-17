import { useConnection } from "@zerve/client/Connection";
import { ConnectionExceptionContext } from "@zerve/client/Query";
import { useModal } from "@zerve/zen";
import { ReactNode } from "react";
import { LoginForm } from "../components/Auth";
import { setSession } from "./ConnectionStorage";

export function AuthorizedArea({ children }: { children: ReactNode }) {
  const conn = useConnection();
  const openLogin = useModal<void>(({ onClose }) => (
    <LoginForm
      path={["Auth"]}
      authMeta={{}}
      onComplete={(userId) => {
        onClose();
      }}
    />
  ));
  return (
    <ConnectionExceptionContext.Provider
      value={{
        onUnauthorized: () => {
          conn && setSession(conn.key, null);
          openLogin();
        },
      }}
    >
      {children}
    </ConnectionExceptionContext.Provider>
  );
}
