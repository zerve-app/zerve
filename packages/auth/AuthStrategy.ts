import { FromSchema, JSONSchema } from "@zerve/core";
import { SystemFilesModule } from "@zerve/system-files";

type StrategyAuthentication<AuthenticationDetails extends Object = {}> = {
  strategyKey: string;
  authTime: number;
} & AuthenticationDetails;

export type AuthStrategy<
  AuthorizePayloadSchema extends JSONSchema,
  Details,
  AuthenticationDetails = {}
> = {
  authorizeSchema: AuthorizePayloadSchema;
  authorize: (
    payload: FromSchema<AuthorizePayloadSchema>,
    strategyFiles: SystemFilesModule
  ) => Promise<null | StrategyAuthentication<AuthenticationDetails>>;
  getDetails: (
    strategyFiles: SystemFilesModule,
    strategyKey: string
  ) => Promise<Details>;
};
