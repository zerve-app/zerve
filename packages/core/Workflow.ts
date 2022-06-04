import { FromSchema, JSONSchema } from "json-schema-to-ts";
import {
  createZAction,
  createZMetaContainer,
  createZGroup,
  AnyZed,
  createZContainer,
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

type ZWorkflowDefinition = {};
type ZCallsCollection = {};

const RunKeySchema = { type: "string", title: "Run ID" } as const;

function zWorkflowCallsCollection(
  parent?: ZCallsCollection | null
): ZCallsCollection {
  return {};
}
function zWorkflowInstance(
  workflow: ZWorkflowDefinition,
  actions: Record<string, AnyZed>,
  parentCalls: ZCallsCollection
) {
  const calls = zWorkflowCallsCollection(parentCalls);
  return { calls };
}

export function zWorkflowEnvironment(
  actions: Record<string, AnyZed>,
  workflows: Record<string, AnyZed>
) {
  console.log("creating z workflow env");
  const calls = zWorkflowCallsCollection();
  return createZMetaContainer(
    {
      actions,
      calls,
      workflows: createZContainer(
        Object.fromEntries(
          Object.entries(workflows).map(([workflowName, workflow]) => [
            workflowName,
            zWorkflowInstance(workflow, actions, calls),
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
