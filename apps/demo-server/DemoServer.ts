import { startZedServer } from "@zerve/node";
import { createZAction, createZContainer, createZState } from "@zerve/core";

export async function startApp() {
  const calculatorValue = createZState({ type: "number" } as const, 0);

  const calculator = createZContainer({
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

  const zRoot = createZContainer({
    calculator,
  });

  await startZedServer(3999, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
