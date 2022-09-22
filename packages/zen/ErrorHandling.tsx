import { AnyError } from "@zerve/zed";

export function stringifyValidationErrors(errors: any) {
  return errors
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

export function extractErrorMessage(error: AnyError) {
  let message = error.message;

  if (error.details?.errors) {
    const { errors } = error.details;
    // if there is a oneOf error it may be confusing becuase we get a bunch of unrelated errors for non-matched schemas, typically via const errors but this may cause edge cases.
    if (errors.find((e) => e.keyword === "oneOf")) {
      // a oneOf schema had errors. find the oneOf error.
      const oneOfError = errors.find((e) => e.keyword === "oneOf");
      // sort the relevant errors within this oneOf path
      const oneOfErrors = [];
      const restErrors = [];
      errors.forEach((e) => {
        if (e === oneOfError) return;
        if (e.instancePath.startsWith(oneOfError.instancePath))
          oneOfErrors.push(e);
        else restErrors.push(e);
      });
      const filteredOneOfErrors = oneOfErrors.filter(
        (e) => e.keyword !== "const",
      );
      message = stringifyValidationErrors([
        ...filteredOneOfErrors,
        ...restErrors,
      ]);
    } else {
      message = stringifyValidationErrors(error.details.errors);
    }
  }
  return message;
}
