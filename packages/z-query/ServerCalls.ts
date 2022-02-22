import { serverGet, serverPost } from "./Connection";

export async function serverAction<Action, Response>(
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
