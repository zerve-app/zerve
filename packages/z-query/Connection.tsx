import { createContext, useContext } from "react";
import { Query } from "react-query";

export type QueryContext = {
  url: string;
  key: string;
};

const DefaultProductionConnection = {
  url: `https://zerve.app`,
  key: "DefaultProductionConnection",
};
const DefaultDevConnection = {
  url: `http://localhost:3888`,
  key: "DefaultDevConnection",
};

const QueryReactContext = createContext<QueryContext | null>(null);

export const QueryConnectionProvider = QueryReactContext.Provider;

export function useConnectionContext(): QueryContext | null {
  return useContext(QueryReactContext);
}

export async function serverGet<Response>(
  context: QueryContext,
  path: string
): Promise<Response> {
  const res = await fetch(`${context.url}/${path}`, {
    headers: {
      Accept: "application/json",
    },
  });
  try {
    const value = await res.json();
    return value;
  } catch (e) {
    console.error("Failed to GET " + path);
    throw e;
  }
}

export async function serverPost<Request, Response>(
  context: QueryContext,
  path: string,
  body: Request
): Promise<Response> {
  const res = await fetch(`${context.url}/${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify(body),
  });
  try {
    const value = await res.json();
    if (res.status !== 200) {
      console.log("Huh eh", value);
      throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    throw new Error("Network request failed");
  }
}
