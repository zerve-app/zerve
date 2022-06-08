import React, { useState } from "react";

import { RootStackScreenProps } from "../app/Links";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import ScreenContainer from "../components/ScreenContainer";

export default function JSONInputScreen({
  navigation,
  route,
}: RootStackScreenProps<"JSONInput">) {
  const [value, setValue] = useState(route.params.value);
  const { onValue } = route.params;
  return (
    <ScreenContainer scroll>
      <JSONSchemaEditor
        value={value}
        schema={route.params.schema}
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
