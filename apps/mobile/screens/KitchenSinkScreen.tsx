import React, { useState } from "react";

import { RootStackScreenProps } from "../app/Links";
import { DisclosureSection, Label, PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { JSONSchema } from "@zerve/core";

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

function JSONSchemaFormExample({
  schema,
  initState = null,
}: {
  schema: JSONSchema;
  initState?: any;
}) {
  const [state, setState] = useState(initState);
  return <JSONSchemaForm value={state} onValue={setState} schema={schema} />;
}

export default function KitchenSinkScreen({
  navigation,
}: RootStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  const [state, setState] = useState(null);
  return (
    <AppPage>
      <PageTitle title="Kitchen Sink" />
      <DisclosureSection header={<Label>Read-Only JSON Schema</Label>}>
        <JSONSchemaForm
          value={12.1}
          schema={{
            type: "number",
          }}
        />
        <JSONSchemaForm
          value={12}
          schema={{
            type: "integer",
          }}
        />
        <JSONSchemaForm
          value={"woah"}
          schema={{
            type: "string",
          }}
        />
        <JSONSchemaForm
          value={true}
          schema={{
            type: "boolean",
          }}
        />
        <JSONSchemaForm
          value={["list", "of", "strings"]}
          schema={{
            type: "array",
            items: {
              type: "string",
              description: "important details",
            },
          }}
        />
      </DisclosureSection>
      <DisclosureSection header={<Label>Writable JSON Schema</Label>}>
        <JSONSchemaFormExample
          initState={12.1}
          schema={{
            type: "number",
          }}
        />
        <JSONSchemaFormExample
          initState={12}
          schema={{
            type: "integer",
          }}
        />
        <JSONSchemaFormExample
          initState={"woah"}
          schema={{
            type: "string",
          }}
        />
        <JSONSchemaFormExample
          initState={"post"}
          schema={{
            enum: ["post", "get", "put", "delete", "options"],
          }}
        />
        <JSONSchemaFormExample
          initState={true}
          schema={{
            type: "boolean",
          }}
        />
        <JSONSchemaFormExample
          initState={["list", "of", "strings"]}
          schema={{
            type: "array",
            items: {
              type: "string",
            },
          }}
        />
      </DisclosureSection>
      <DisclosureSection header={<Label>Advanced Union Schema</Label>}>
        <JSONSchemaFormExample schema={testSchema2} />
      </DisclosureSection>
    </AppPage>
  );
}
