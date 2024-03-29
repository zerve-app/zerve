import { useState } from "react";
import { RootStackScreenProps } from "../app/Links";
import { JSONSchemaEditor } from "@zerve/zen/JSONSchemaEditor";
import ScreenContainer from "@zerve/zen/ScreenContainer";

export default function JSONInputScreen({
  navigation,
  route,
}: RootStackScreenProps<"JSONInput">) {
  const [value, setValue] = useState(route.params.value);
  const { onValue } = route.params;
  return (
    <ScreenContainer scroll>
      <JSONSchemaEditor
        id={`${route.key}-jsoninput`}
        value={value}
        schema={route.params.schema}
        schemaStore={{}}
        onValue={
          onValue
            ? (v) => {
                setValue(v);
                onValue(v);
              }
            : undefined
        }
      />
    </ScreenContainer>
  );
}
