// import { JSONSchema } from "json-schema-to-ts";

import { SchemaStore } from ".";

// export type ZSchema<S extends JSONSchema> = {
//   name: string;
//   schemaRef: {
//     $ref: string;
//   };
//   schema: S;
// };

// export function createZSchema<S extends JSONSchema>(
//   name: string,
//   schema: S
// ): ZSchema<S> {
//   if (typeof schema === "boolean") {
//     throw new Error("unsupported schema");
//   }
//   const id = `https://fixme.app/.z/Types/${name}`;
//   return {
//     name,
//     schemaRef: {
//       $ref: id,
//     } as const,
//     schema: {
//       ...schema,
//       $id: id,
//       $schema: "https://json-schema.org/draft/2020-12/schema",
//     } as const,
//   } as const;
// }

export function getDefaultSchemaValue(
  schema: any,
  schemaStore?: SchemaStore
): any {
  let usableSchema = schema;
  if (schema === false) throw new Error("Cannot find value for false schema");
  if (schema === true) return null;
  if (schema.type === "null") return null;
  if (schema.$ref) {
    const refSchema = Object.values(schemaStore || {}).find(
      (s) => s.$id === schema.$ref
    );
    if (refSchema) {
      usableSchema = refSchema;
    } else throw new Error("Schema Ref not Found");
  }
  if (usableSchema.default) return usableSchema.default; // maybe this should be validated? idk.
  if (usableSchema.type === "boolean") return false;
  if (usableSchema.type === "number") return 0;
  if (usableSchema.type === "integer") return 0;
  if (usableSchema.type === "string") return "";
  if (usableSchema.type === "array") return []; // todo: handle tuples..
  if (usableSchema.type === "object")
    return Object.fromEntries(
      Object.entries(schema.properties || {}).map(
        ([propertyName, propertySchema]) => [
          propertyName,
          getDefaultSchemaValue(propertySchema, schemaStore),
        ]
      )
    );
}
