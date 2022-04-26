import { RootNavigator } from "@zerve/zoo/app/NativeNavigation";
import { Provider } from "@zerve/zoo/provider";

export default function App() {
  return (
    <Provider>
      <RootNavigator />
    </Provider>
  );
}
