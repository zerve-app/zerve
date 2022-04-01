import { startZedServer } from "@zerve/node";
import { createZAction, createZContainer, createZGettable } from "@zerve/core";

export async function startApp() {
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
