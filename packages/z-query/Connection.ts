export const HOST = `http://localhost:3888`;

export async function serverGet<Response>(path: string): Promise<Response> {
  const res = await fetch(`${HOST}/${path}`, {
    headers: {
      Accept: "application/json",
    },
  });
  const value = await res.json();
  return value;
}

export async function serverPost<Request, Response>(
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
