// import { JSONSchema } from "json-schema-to-ts";

import { SchemaStore } from "./Validate";
import { isEmptySchema } from "./JSONSchema";
import { JSONSchema } from "json-schema-to-ts";

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
  schema: JSONSchema,
  schemaStore?: SchemaStore,
): any {
  if (isEmptySchema(schema)) return null;
  if (schema === true) return null;
  if (schema === false) return null;
  let usableSchema = schema;
  if (schema.$ref) {
    const refSchema = Object.values(schemaStore || {}).find(
      (s) => s.$id === schema.$ref,
    );
    if (refSchema) {
      usableSchema = refSchema;
    } else {
      debugger;
      throw new Error("Schema Ref not Found");
    }
  }
  if (usableSchema.default) return usableSchema.default; // maybe this should be validated? idk.
  if (usableSchema.const !== undefined) return usableSchema.const;
  if (usableSchema.type === "boolean") return false;
  if (usableSchema.type === "number") return 0;
  if (usableSchema.type === "integer") return 0;
  if (usableSchema.type === "string") return "";
  if (usableSchema.type === "array") return []; // todo: handle tuples..
  if (usableSchema.type === "object") {
    return Object.fromEntries(
      Object.entries(usableSchema.properties || {}).map(
        ([propertyName, propertySchema]) => [
          propertyName,
          getDefaultSchemaValue(propertySchema, schemaStore),
        ],
      ),
    );
  }
  if (usableSchema.oneOf) {
    return getDefaultSchemaValue(usableSchema.oneOf[0], schemaStore);
  }
  throw new Error("Cannot find a default value for this schema");
}
