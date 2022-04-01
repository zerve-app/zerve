import { FromSchema, GenericError } from "@zerve/core";
import { createZChainStateCalculator } from "@zerve/chain";

const LedgerStateSchema = {
  type: "object",
  additionalProperties: false,
  required: ["accounts"],
  properties: {
    accounts: {
      type: "object",
      additionalProperties: { type: "number" },
    },
  },
} as const;

export type LedgerState = FromSchema<typeof LedgerStateSchema>;

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

export const ChainLedgerCalculator = createZChainStateCalculator(
  LedgerStateSchema,
  defaultLedgerState,
  {
    InjectValue: {
      schema: InjectValueActionSchema,
      handler: (
        state: LedgerState,
        action: FromSchema<typeof InjectValueActionSchema>
      ) => {
        return {
          accounts: {
            ...state.accounts,
            [action.account]:
              action.amount + state.accounts[action.account] || 0,
          },
        };
      },
    },

    DestroyValue: {
      schema: DestroyValueActionSchema,
      handler: (
        state: LedgerState,
        action: FromSchema<typeof InjectValueActionSchema>
      ) => {
        if (action.amount <= 0) {
          throw new GenericError({
            code: "InvalidAmount",
            message: `Cannot DestroyValue of invalid amount: "${action.amount}".`,
            params: { amount: action.amount },
          });
        }
        const account = state.accounts[action.account];
        if (!account || account < action.amount) {
          throw new GenericError({
            code: "InsufficientAmount",
            message: `Cannot DestroyValue when account "${action.account}" does not contain this amount.`,
            params: { account: action.account, amount: action.amount },
          });
        }
        return {
          accounts: {
            ...state.accounts,
            [action.account]: account - action.amount,
          },
        };
      },
    },

    TransferValue: {
      schema: TransferValueActionSchema,
      handler: (
        state: LedgerState,
        action: FromSchema<typeof TransferValueActionSchema>
      ) => {
        if (action.amount <= 0) {
          throw new GenericError({
            code: "InvalidAmount",
            message: `Cannot TransferValue of invalid amount: "${action.amount}".`,
            params: { amount: action.amount },
          });
        }
        const fromAccountValue = state.accounts[action.fromAccount];
        if (!fromAccountValue || fromAccountValue < action.amount) {
          throw new GenericError({
            code: "InsufficientAmount",
            message: `Cannot TransferValue when account "${action.fromAccount}" does not contain this amount.`,
            params: { fromAccount: action.fromAccount, amount: action.amount },
          });
        }

        const toAccountValue = state.accounts[action.toAccount] || 0;
        return {
          accounts: {
            ...state.accounts,
            [action.fromAccount]: fromAccountValue - action.amount,
            [action.toAccount]: toAccountValue + action.amount,
          },
        };
      },
    },
  }
);
