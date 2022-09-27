import { useModal } from "@zerve/zen/Modal";
import { LoginForm } from "../components/Auth";

export function useWebAuthModal(onAuthenticated?: (userId: string) => void) {
  const openLogin = useModal<{ connection: string; path: string[] }>(
    ({ onClose, options }) => (
      <LoginForm
        path={options.path}
        authMeta={{}}
        onComplete={(userId) => {
          onClose();
          onAuthenticated?.(userId);
        }}
      />
    ),
  );
  return openLogin;
}
