import { FromSchema, JSONSchema } from "@zerve/core";
import { SystemFilesModule } from "@zerve/system-files";

type StrategyAuthorization<AuthorizationDetails extends Object = {}> = {
  strategyKey: string;
  authTime: number;
} & AuthorizationDetails;

export type AuthStrategy<
  AuthorizePayloadSchema extends JSONSchema,
  Details,
  AuthorizationDetails = {}
> = {
  authorizeSchema: AuthorizePayloadSchema;
  authorize: (
    payload: FromSchema<AuthorizePayloadSchema>,
    strategyFiles: SystemFilesModule
  ) => Promise<null | StrategyAuthorization<AuthorizationDetails>>;
  getDetails: (
    strategyFiles: SystemFilesModule,
    strategyKey: string
  ) => Promise<Details>;
};
