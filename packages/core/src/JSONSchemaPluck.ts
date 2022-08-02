import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { FlexibleJSONSchema, FlexibleObjectyJSONSchema } from "./JSONSchema";
import { exploreUnionSchema } from "./UnionSchema";

export function ensureObjectyJSONSchema(
  s: FlexibleJSONSchema
): FlexibleObjectyJSONSchema {
  if (Array.isArray(s)) {
    return {
      oneOf: s,
    };
  }
  if (typeof s !== "object") throw new Error("Can only expand object schemas");
  return s;
}

function expandEnumSchema(s: FlexibleJSONSchema): FlexibleJSONSchema {
  const schema = ensureObjectyJSONSchema(s);

  if (!schema.enum) return schema;
  return {
    ...schema,
    enum: undefined,
    oneOf: schema.enum.map((constVal) => ({
      const: constVal,
    })),
  };
}

// takes an arbitrary value and grabs the subset of schema from it.
export function JSONSchemaPluck<Schema extends JSONSchema>(
  schema: Schema,
  value: any
): FromSchema<Schema> {
  const schema1 = ensureObjectyJSONSchema(
    expandEnumSchema(schema as FlexibleJSONSchema)
  );

  if (schema1.oneOf) {
    const { options, converters, match } = exploreUnionSchema(schema1);
    const matched = match(value);
    if (!matched) return schema1["default"];
  }

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
