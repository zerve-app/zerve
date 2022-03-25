import React, { useState } from "react";

import { RootStackScreenProps } from "../app/Links";
import { Page, PageTitle, Paragraph } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import ScreenContainer from "../components/ScreenContainer";

export default function JSONInputScreen({
  navigation,
  route,
}: RootStackScreenProps<"JSONInput">) {
  const [value, setValue] = useState(route.params.value);
  return (
    <ScreenContainer scroll>
      <JSONSchemaForm
        value={value}
        schema={route.params.schema}
        onValue={
          route.params.onValue
            ? (v) => {
                setValue(v);
                route.params.onValue(v);
              }
            : undefined
        }
      />
    </ScreenContainer>
  );
}
