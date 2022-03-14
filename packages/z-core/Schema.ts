import { JSONSchema } from "json-schema-to-ts";

export type ZSchema<S extends JSONSchema> = {
  name: string;
  schemaRef: {
    $ref: string;
  };
  schema: S;
};

export function createZSchema<S extends JSONSchema>(
  name: string,
  schema: S
): ZSchema<S> {
  if (typeof schema === "boolean") {
    throw new Error("unsupported schema");
  }
  const id = `https://fixme.app/.z/Types/${name}`;
  return {
    name,
    schemaRef: {
      $ref: id,
    } as const,
    schema: {
      ...schema,
      $id: id,
      $schema: "https://json-schema.org/draft/2020-12/schema",
    } as const,
  } as const;
}
