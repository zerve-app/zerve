import React, { useState } from "react";

import { RootStackScreenProps } from "../app/Links";
import { PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { JSONSchemaForm } from "../components/JSONSchemaForm";

const testSchema0 = {
  oneOf: [{ type: "number" }, { type: "string" }],
} as const;
const testSchema1 = {
  oneOf: [
    {
      type: "object",
      properties: {
        c: { const: "foo" },
        age: { type: "number" },
        isCool: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: { c: { const: "bar" }, name: { type: "string" } },
      additionalProperties: false,
    },
  ],
} as const;
const testSchema2 = {
  oneOf: [
    {
      // title: "yes this is a type",
      type: "object",
      properties: {
        c: { const: "foo" },
        age: { type: "number" },
        isCool: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        c: { const: "bar" },
        c1: { const: "a" },
        name: { type: "string" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        c: { const: "bar" },
        c1: { const: "b" },
        name: { type: "string" },
        name2: { type: "string" },
      },
      additionalProperties: false,
    },
  ],
} as const;

export default function KitchenSinkScreen({
  navigation,
}: RootStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  const [state, setState] = useState(null);
  return (
    <AppPage>
      <PageTitle title="Kitchen Sink" />
      <JSONSchemaForm value={state} onValue={setState} schema={testSchema2} />
    </AppPage>
  );
}
