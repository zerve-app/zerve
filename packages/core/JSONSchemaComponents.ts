import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type FieldComponentProps<FieldSchema extends JSONSchema> = {
  id: string;
  onSubmitEditing: (() => void) | undefined;
  value: FromSchema<FieldSchema>;
  onValue?: undefined | ((v: FromSchema<FieldSchema>) => void);
  schema: FieldSchema;
};
