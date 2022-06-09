# Zed

Zed is a TypeScript library that builds upon JSON schema to provide a queryable API. So consumers of a Zed API can use typescript or an HTTP-JSON API.

## ZGettable

An API endpoint that asynchronously fetches some JSON. The schema specifies the shape of the json.

`createZGettable(schema, getter)`

```
  const zGetString = createZGettable(
    {
      type: "string",
    } as const,
    async (params: null) => {
      return "Hello";
    }
  );
```

## ZContainer

`createZContainer({ ...children })`

## ZAction

`createZAction(payloadSchema, responseSchema, actionHandler)`
