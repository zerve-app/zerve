export function displayStoreFileName(name: string) {
  return name.replaceAll("_", " ");
}

export function prepareStoreFileName(name: string) {
  return name.replaceAll(" ", "_");
}
