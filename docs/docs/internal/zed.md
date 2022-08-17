---
---

# Zed Tools

Zed is a TypeScript library that allows you to define a type-safe API that can be consumed directly in your code, or exposed over an API. It builds on JSON schema to define types that can be serialized over the API, so client apps can safely access API features, and provide users with an easy-to-use UI for your server functionality.

> Note: This documentation is a work-in-progress! [Refer to the code](https://github.com/zerve-app/zerve/blob/main/packages/core/Zed.ts) for a more in-depth understanding on the current state of Zed Tools

## ZGettable

An API endpoint that asynchronously fetches some JSON. The schema specifies the shape of the json.

`createZGettable(schema, getter)`

```tsx
const zGetString = createZGettable(
  {
    type: "string",
  } as const,
  async (params: null) => {
    return "Hello";
  },
);
```

## ZContainer

Group together an arbitrary set of Zed functionality with names. Basically this is an API 'object', or sub-path.

`createZContainer({ ...children })`

## ZAction

Define an async action on the server, and provide a schema that informs the client what schema of data should be sent and returned by the action.

`createZAction(payloadSchema, responseSchema, actionHandler)`

## ZGroup

## ZGettableGroup

## ZStatic

## ZAuthContainer

this one is confusing!
