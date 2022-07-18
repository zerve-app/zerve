import { FromSchema, JSONSchema } from "json-schema-to-ts";
import {
  createZAction,
  createZMetaContainer,
  createZGroup,
  AnyZed,
  createZContainer,
  createZGettableGroup,
  createZStatic,
  ZGettableGroup,
} from "./Zed";

const CallActionStepSchema = {
  type: "object",
  properties: {
    type: { const: "CallAction" },
    path: { type: "string" },
    payload: {},
  },
  additionalProperties: false,
  required: ["type", "path", "payload"],
} as const;
type CallActionStep = FromSchema<typeof CallActionStepSchema>;

// const WorkflowStepSchema = {
//   oneOf:[CallActionStepSchema]
// }
const WorkflowStepSchema = CallActionStepSchema;

type WorkflowStep = FromSchema<typeof WorkflowStepSchema>;
type WorkflowSteps = WorkflowStep[];

export type CallOptions = {
  as?: string;
  after?: string[];
};

export type ZWorkflowDefinition = {};
export type ZCallHahaha = {};

export type ZCallsCollection = ZGettableGroup<ZCallHahaha>;

const RunKeySchema = { type: "string", title: "Run ID" } as const;

const WorkflowCallSchema = {
  type: "object",
  properties: {
    startTime: { type: "number" },
  },
  required: [],
  additionalProperties: false,
} as const;

function zWorkflowCallsCollection(parent?: ZCallsCollection | null) {
  return createZGettableGroup(
    async (id) => {
      return createZStatic(id);
    },
    async ({}) => {
      return { children: ["foo", "bar"], more: false, cursor: "" };
    }
  );
}
function zWorkflowInstance(
  workflow: ZWorkflowDefinition,
  zContext: Record<string, AnyZed>,
  parentCalls: ZCallsCollection
) {
  const calls = zWorkflowCallsCollection(parentCalls);
  return { calls };
}

export function zWorkflowEnvironment(
  zContext: Record<string, AnyZed>,
  workflows: Record<string, AnyZed>
) {
  const calls = zWorkflowCallsCollection();
  return createZMetaContainer(
    {
      context: createZContainer(zContext),
      calls,
      workflows: createZContainer(
        Object.fromEntries(
          Object.entries(workflows).map(([workflowName, workflow]) => [
            workflowName,
            zWorkflowInstance(workflow, zContext, calls),
          ])
        )
      ),
    },
    {
      zContract: "WorkflowEnvironment",
    }
  );
}

export function zWorkflow<Payload extends JSONSchema>(definition: {
  startPayloadSchema: Payload;
  steps: WorkflowSteps;
}): ZWorkflowDefinition {
  return {};
}

export function zWorkflowCallStep<P>(
  path: string,
  payload: P,
  callOptions: CallOptions
): CallActionStep {
  return { type: "CallAction", path, payload, callOptions };
}
