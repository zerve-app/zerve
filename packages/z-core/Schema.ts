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

export function getDefaultSchemaValue(schema: any): any {
  if (schema === false) throw new Error("Cannot find value for false schema");
  if (schema === true) return null;
  if (schema.type === "null") return null;
  if (schema.default) return schema.default; // maybe this should be validated? idk.
  if (schema.type === "boolean") return false;
  if (schema.type === "number") return 0;
  if (schema.type === "integer") return 0;
  if (schema.type === "string") return "";
  if (schema.type === "array") return []; // todo: handle tuples..
  if (schema.type === "object")
    return Object.fromEntries(
      Object.entries(schema.properties).map(
        ([propertyName, propertySchema]) => [
          propertyName,
          getDefaultSchemaValue(propertySchema),
        ]
      )
    );
}
