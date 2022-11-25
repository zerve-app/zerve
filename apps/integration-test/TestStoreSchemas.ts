import { NumberSchema, createSchemaRef } from "@zerve/zed";

const TestObjSchema = {
  type: "object",
  properties: {
    r: NumberSchema,
  },
  required: ["r"],
} as SomeJSONSchema;

export const TestStoreSchemas = { TestObj: TestObjSchema };

export const TestStoreSchemasPublic = Object.fromEntries(
  Object.entries(TestStoreSchemas).map(([key, value]) => [
    key,
    { ...value, readOnly: true },
  ]),
);

export const TestEntrySchemas = {
  TestList: {
    type: "array",
    items: createSchemaRef("TestObj"),
  },
};
