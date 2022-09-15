import { LoginForm } from "../components/Auth";
import { useModal } from "@zerve/zen";

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
