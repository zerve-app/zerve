import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { exploreUnionSchema } from "./UnionSchema";

function expandEnumSchema(s) {
  if (!s.enum) return s;
  return {
    ...s,
    enum: undefined,
    oneOf: s.enum.map((constVal: number | string) => ({ const: constVal })),
  };
}

// takes an arbitrary value and grabs the subset of schema from it.
export function JSONSchemaPluck<Schema extends JSONSchema>(
  schema: Schema,
  value: any
): FromSchema<Schema> {
  const schema1 = expandEnumSchema(schema);

  if (schema1.oneOf) {
    const { options, converters, match } = exploreUnionSchema(schema1);
    const matched = match(value);
    if (!matched) return schema1["default"];
  }

  console.log("JSONSchemaPluck", { schema, value });
  if (schema === true) return value;
  if (schema === false)
    throw new Error("Cannot pluck JSON value for false schema");
  const type = schema.type as string | undefined;
  if (!type) return value;
  if (Array.isArray(type))
    throw new Error("Pluck can not handle array type schemas yet");
  if (schema.enum) throw new Error("OneOF notn supported in pluck yet");
  if (schema.oneOf) throw new Error("OneOF notn supported in pluck yet");
  if (type === "object") {
    return value; // todo pluck value according to object schema
  }
  if (type === "array") return value; // todo pluck value according to object schema
  if (type === "string") return String(value) as any;
  if (type === "number") return Number(value) as any;
  if (type === "boolean") return Boolean(value) as any;
  // fallback behavior does not pluck?? or should throw an error here?
  return value;
}
