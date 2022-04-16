import { FromSchema, JSONSchema } from "@zerve/core";
import { SystemFilesModule } from "@zerve/system-files";

type AuthorizationToken = {
  strategyKey: string;
  userKey: string;
};

export type AuthStrategy<AuthorizePayloadSchema extends JSONSchema, Details> = {
  authorizeSchema: AuthorizePayloadSchema;
  authorize: (
    payload: FromSchema<AuthorizePayloadSchema>,
    strategyFiles: SystemFilesModule
  ) => Promise<null | AuthorizationToken>;
  getDetails: (
    strategyFiles: SystemFilesModule,
    strategyKey: string
  ) => Promise<Details>;
};
