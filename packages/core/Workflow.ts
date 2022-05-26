import { FromSchema, JSONSchema } from "json-schema-to-ts";
import {
  createZAction,
  createZMetaContainer,
  createZGroup,
  AnyZed,
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

const RunKeySchema = { type: "string", title: "Run ID" } as const;

export function createZWorkflowEnvironment(
  zedRecord: Record<string, AnyZed>,
  workflows: Record<string, AnyZed>
) {}

export function createZWorkflow<Payload extends JSONSchema>(definition: {
  startPayloadSchema: Payload;
  steps: WorkflowSteps;
}) {
  return createZMetaContainer(
    {
      start: createZAction(
        definition.startPayloadSchema,
        RunKeySchema,
        async (startPayload: FromSchema<Payload>) => {
          let stepIndex = 0;
          const statePromised = {};
          const stateResolved = {};
          const stateRejected = {};
          function getStepKey() {
            const k = `step${stepIndex}`;
            stepIndex += 1;
            return k;
          }
          const stateSteps = definition.steps.map((step) => {
            const defaultStepKey = getStepKey();
            const stepKey = step.callOptions?.as || defaultStepKey;
            return [stepKey, step];
          });

          async function performReadySteps() {
            const readySteps = Object.stateSteps;
          }

          console.log("doing workflow now, ok?!", definition.steps.length);
          return "runId";
        }
      ),
      runs: createZGroup(async (id: string) => {
        return createZContainer({
          runId: createZStatic(id),
          isRunning: createZStatic(false),
        });
      }),
    },
    {
      zContract: "Workflow",
    }
  );
}

export function zWorkflowCallStep<P>(
  path: string,
  payload: P,
  callOptions: CallOptions
): CallActionStep {
  return { type: "CallAction", path, payload, callOptions };
}
