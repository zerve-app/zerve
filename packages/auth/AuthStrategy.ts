import { FromSchema, JSONSchema } from "@zerve/core";

export type AuthStrategy<
  AuthorizationToken,
  AuthorizePayloadSchema extends JSONSchema
> = {
  authorizeSchema: AuthorizePayloadSchema;
  authorize: (
    payload: FromSchema<AuthorizePayloadSchema>
  ) => Promise<null | AuthorizationToken>;
};
