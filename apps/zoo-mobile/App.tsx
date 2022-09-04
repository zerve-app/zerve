import { Provider } from "@zerve/zoo/provider";
import { RootNavigator } from "@zerve/zoo/app/NativeNavigation";

export default function App() {
  return (
    <Provider>
      <RootNavigator />
    </Provider>
  );
}
