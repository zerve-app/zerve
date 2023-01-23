import type { Awaitable } from "next-auth";
import { useState } from "react";
import { IconButton } from "./Button";
import { DialogTitle, useDialog } from "./Dialog";

export function StringForm({
  onSubmit,
  initValue,
}: {
  onSubmit: (value: string) => Awaitable<void>;
  initValue: string;
}) {
  const [value, setValue] = useState(initValue);
  return (
    <form
      onSubmit={(e) => {
        onSubmit(value);
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Save!</button>
    </form>
  );
}

export function StringEditRow({
  description,
  value,
  onValue,
  isLoading,
}: {
  description: string;
  value?: string | null;
  isLoading?: boolean;
  onValue: (value: string) => Awaitable<void>;
}) {
  const [onOpen, dialog] = useDialog(({ close }) => {
    return (
      <>
        <DialogTitle>Rename urself</DialogTitle>
        {isLoading && <p>loading...</p>}
        <StringForm
          initValue={value || ""}
          onSubmit={(value) => {
            close();
            onValue(value);
          }}
        />
        <div className="mt-2">
          <p className="text-sm text-gray-500">change the text, yo!</p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={close}
          >
            Got it, thanks!
          </button>
        </div>
      </>
    );
  });
  return (
    <div className="flex flex-row items-center justify-between flex-grow ">
      <label className="flex flex-col">{description}</label>
      <label className="flex flex-col">{value}</label>
      <IconButton
        onPress={onOpen}
        icon={<EditIcon />}
        // label="Edit"
      />
      {dialog}
    </div>
  );
}

function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      version="1.1"
      id="edit"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      width={size}
      height={size}
      y="0px"
      viewBox="0 0 217.855 217.855"
      // style={{ "enable-background": "new 0 0 217.855 217.855" }}
      xmlSpace="preserve"
    >
      <path
        fill="currentColor"
        d="M215.658,53.55L164.305,2.196C162.899,0.79,160.991,0,159.002,0c-1.989,0-3.897,0.79-5.303,2.196L3.809,152.086
 c-1.35,1.352-2.135,3.166-2.193,5.075l-1.611,52.966c-0.063,2.067,0.731,4.069,2.193,5.532c1.409,1.408,3.317,2.196,5.303,2.196
 c0.076,0,0.152-0.001,0.229-0.004l52.964-1.613c1.909-0.058,3.724-0.842,5.075-2.192l149.89-149.889
 C218.587,61.228,218.587,56.479,215.658,53.55z M57.264,201.336l-42.024,1.28l1.279-42.026l91.124-91.125l40.75,40.743
 L57.264,201.336z M159,99.602l-40.751-40.742l40.752-40.753l40.746,40.747L159,99.602z"
      />
    </svg>
  );
}
