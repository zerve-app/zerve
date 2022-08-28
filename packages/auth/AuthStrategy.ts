import { FromSchema, JSONSchema } from "@zerve/zed";

type StrategyAuthentication<AuthenticationDetails extends Object = {}> = {
  strategyKey: string;
  authTime: number;
} & AuthenticationDetails;

export type AuthStrategy<
  AuthorizePayloadSchema extends JSONSchema,
  Details,
  AuthenticationDetails = {},
> = {
  authorizeSchema: AuthorizePayloadSchema;
  authorize: (
    payload: FromSchema<AuthorizePayloadSchema>,
    strategyFilesPath: string,
  ) => Promise<null | StrategyAuthentication<AuthenticationDetails>>;
  getDetails: (
    strategyFilesPath: string,
    strategyKey: string,
  ) => Promise<Details>;
};
