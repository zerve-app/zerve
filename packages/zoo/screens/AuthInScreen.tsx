import { RootStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { LoginForm } from "../components/Auth";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";

export default function AuthInScreen({
  navigation,
  route,
}: RootStackScreenProps<"AuthIn">) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={"Log In / Register"} />
      <ConnectionKeyProvider value={route.params.connection}>
        <LoginForm
          path={route.params.path}
          authMeta={{}}
          onComplete={() => {
            navigation.goBack();
          }}
          onCancel={() => {
            navigation.goBack();
          }}
        />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
