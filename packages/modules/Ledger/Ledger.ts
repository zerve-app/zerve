import { FromSchema, GenericError } from "@zerve/core";
import { createZChainStateCalculator } from "../CoreChain/CoreChain";

export type LedgerState = {
  accounts: Record<string, number>;
};

const defaultLedgerState: LedgerState = { accounts: {} };

const InjectValueActionSchema = {
  title: "Inject Value",
  type: "object",
  properties: {
    amount: { type: "number", minimum: 0 },
    account: { type: "string" },
  },
  required: ["amount", "account"],
  additionalProperties: false,
} as const;

const DestroyValueActionSchema = {
  title: "Destroy Value",
  type: "object",
  properties: {
    amount: { type: "number", minimum: 0 },
    account: { type: "string" },
  },
  required: ["amount", "account"],
  additionalProperties: false,
} as const;

const TransferValueActionSchema = {
  title: "Transfer Value",
  type: "object",
  properties: {
    amount: { type: "number", minimum: 0 },
    fromAccount: { type: "string" },
    toAccount: { type: "string" },
  },
  required: ["amount", "fromAccount", "toAccount"],
  additionalProperties: false,
} as const;

const ChainLedgerCalculator = createZChainStateCalculator(defaultLedgerState, {
  InjectValue: {
    schema: InjectValueActionSchema,
    handler: (
      { accounts }: LedgerState,
      action: FromSchema<typeof InjectValueActionSchema>
    ) => {
      return {
        accounts: {
          ...accounts,
          [action.account]: action.amount + accounts[action.account] || 0,
        },
      };
    },
  },

  DestroyValue: {
    schema: DestroyValueActionSchema,
    handler: (
      { accounts }: LedgerState,
      action: FromSchema<typeof InjectValueActionSchema>
    ) => {
      if (accounts[action.account] < accounts[action.account]) {
        throw new GenericError({
          code: "InsufficientAmount",
          message: `Cannot DestroyValue when account "${action.account}" does not contain this amount.`,
          params: { account: action.account, amount: action.amount },
          httpStatus: 500,
        });
      }
      return {
        accounts: {
          ...accounts,
          [action.account]: action.amount - accounts[action.account] || 0,
        },
      };
    },

    TransferValue: {
      schema: TransferValueActionSchema,
      handler: (
        { accounts }: LedgerState,
        action: FromSchema<typeof InjectValueActionSchema>
      ) => {
        if (accounts[action.account] < accounts[action.account]) {
          throw new GenericError({
            code: "InsufficientAmount",
            message: `Cannot DestroyValue when account "${action.account}" does not contain this amount.`,
            params: { account: action.account, amount: action.amount },
            httpStatus: 500,
          });
        }
        return {
          accounts: {
            ...accounts,
            [action.account]: action.amount - accounts[action.account] || 0,
          },
        };
      },
    },
  },
});

const Ledger = {
  ChainLedgerCalculator,
};

export default Ledger;
