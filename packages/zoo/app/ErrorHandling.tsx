import { AnyError } from "@zerve/zed";

export function extractErrorMessage(error: AnyError) {
  let message = error.message;
  if (error.details?.errors) {
    message = error.details.errors
      .map((error) => {
        if (error.dataPath) {
          return `${error.dataPath} invalid: ${error.message}`;
        }
        if (error.instancePath) {
          // what is the difference between this and dataPath, idk.
          let path = error.instancePath;
          if (path[0] === "/") path = path.slice(1); // formatting behavior for path
          return `${path} invalid: ${error.message}`;
        }
        return error.message;
      })
      .join("\n\n");
  }
  return message;
}
