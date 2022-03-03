import { serverGet, serverPost } from "./Connection";

export async function serverAction<Action, Response>(
  action: Action
): Promise<Response> {
  return await serverPost(".z/action", action);
}

export async function listDocs() {
  return await serverGet(`.z`);
}

export async function getDoc(name: string) {
  return await serverGet(`.z/${name}`);
}

export async function getActions(category?: string) {
  if (category) return await serverGet(`.z/action/${category}`);
  return await serverGet(`.z/action`);
}
