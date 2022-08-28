import React from "react";
import { NotFoundError, GenericError } from "./Errors";
import { createContext, ReactNode, useContext } from "react";
import { QueryClientProvider, QueryClient } from "react-query";

export type ServerMessage = {};

export type Connection = {
  key: string;
  name: string;
  url: string;
  session?: SavedSession | null;
};

export type SavedSession = {
  userId: string;
  sessionId: string;
  userLabel: string;
  sessionToken: string | null; // if this token is null, the session is being destroyed!
  authPath: string[];
};

const ConnectionContext = createContext<Connection | null>(null);

const queryClient = new QueryClient();

export function ConnectionProvider({
  value,
  children,
}: {
  value: Connection | null;
  children: ReactNode;
}) {
  return (
    <ConnectionContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConnectionContext.Provider>
  );
}

export function useConnection(): Connection | null {
  return useContext(ConnectionContext);
}

export function useRequiredConnection(): Connection {
  const conn = useContext(ConnectionContext);
  if (conn === null) throw new Error("Connection is required in this Context");
  return conn;
}

export const UnauthorizedSymbol = Symbol("Unauthorized");

export async function serverGet<Response>(
  origin: string,
  path: string,
  query?: Record<string, string> | null,
): Promise<Response | typeof UnauthorizedSymbol> {
  const searchParams = query && new URLSearchParams(query);
  const searchString = searchParams?.toString();
  const res = await fetch(
    `${origin}/${path}${
      searchString && searchString.length ? `?${searchString}` : ""
    }`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  try {
    const value = await res.json();

    if (res.status !== 200) {
      console.error("Request Error", value);
      if (res.status === 401) {
        return UnauthorizedSymbol;
      } else if (res.status === 404) {
        throw new NotFoundError(
          value?.code || "NotFound",
          value?.message || "Not Found.",
          value?.details,
        );
      } else throw new Error("Network Error");
    }
    return value;
  } catch (e) {
    console.error(e);
    if (e.code) throw e;
    else throw new Error("Network Error");
  }
}

export async function serverPost<Request, Response>(
  origin: string,
  path: string,
  body: Request,
): Promise<Response> {
  const res = await fetch(`${origin}/${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify(body),
  });
  let value = undefined;
  try {
    value = await res.json();
  } catch (e) {
    throw new ServerError(e.message);
  }
  if (res.status !== 200) {
    throw new GenericError({
      httpStatus: res.status,
      code: value?.code || "NetworkError",
      message: value?.message || "Network Error",
      details: value?.details,
    });
  }
  return value;
}
