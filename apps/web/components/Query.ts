import { useQuery } from "react-query";

const HOST = `http://localhost:3888`;

async function serverGet<Response>(path: string): Promise<Response> {
  const res = await fetch(`${HOST}/${path}`, {
    headers: {
      Accept: "application/json",
    },
  });
  const value = await res.json();
  return value;
}

async function serverPost<Request, Response>(
  path: string,
  body: Request
): Promise<Response> {
  const res = await fetch(`${HOST}/${path}`, {
    headers: {
      Accept: "application/json",
    },
    method: "post",
    body: JSON.stringify(body),
  });
  const value = await res.json();
  return value;
}

async function serverAction<Action, Response>(
  action: Action
): Promise<Response> {
  return await serverPost(".action", action);
}

export async function listDocs() {
  return await serverGet(`.docs`);
}

export async function getDoc(name: string) {
  return await serverGet(`.docs/${name}`);
}

export function useDocListQuery() {
  return useQuery(["docs", "child-list"], async () => {
    return { docs: await listDocs() };
  });
}

export function useDoc(name: string) {
  return useQuery(["docs", "children", name, "value"], async () => {
    return await getDoc(name);
  });
}
