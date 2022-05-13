import { startZedServer } from "@zerve/node";
import {
  createZAction,
  createZContainer,
  createZGettable,
  createZState,
} from "@zerve/core";

const calculatorValue = createZState({ type: "number" } as const, 0);

const realTimeCalculator = createZContainer({
  value: calculatorValue.z.state,
  add: createZAction(
    { type: "number", title: "Number to Add" } as const,
    { type: "number" } as const,
    async (value: number) => {
      const sum = value + calculatorValue.z.state.get();
      calculatorValue.z.set.call(sum);
      return sum;
    }
  ),
});

let internalValue = 0;

const calculator = createZContainer({
  value: createZGettable({ type: "number" } as const, async () => {
    return internalValue;
  }),
  add: createZAction(
    { type: "number", title: "Number to Add" } as const,
    { type: "number" } as const,
    async (value: number) => {
      internalValue += value;
      return internalValue;
    }
  ),
});

export const zTestRoot = createZContainer({
  calculator,
  realTimeCalculator,
});
