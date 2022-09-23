export function displayStoreFileName(name: string) {
  return name.replaceAll("_", " ");
}

export function prepareStoreFileName(name: string) {
  let prepared = name.replaceAll(" ", "_");
  if (prepared[0] !== prepared[0].toUpperCase()) {
    prepared = `${prepared[0].toUpperCase()}${prepared.slice(1)}`;
  }
  return prepared;
}
