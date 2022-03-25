import React, { useState } from "react";

import { RootStackScreenProps } from "../app/Links";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import ScreenContainer from "../components/ScreenContainer";

export default function JSONInputScreen({
  navigation,
  route,
}: RootStackScreenProps<"JSONInput">) {
  const [value, setValue] = useState(route.params.value);
  const { onValue } = route.params;
  return (
    <ScreenContainer scroll>
      <JSONSchemaForm
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
