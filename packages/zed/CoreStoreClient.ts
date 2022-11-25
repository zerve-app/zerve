export function createSchemaRef(name: string) {
  return {
    $z: "$ref",
    title: name,
    $ref: `https://type.zerve.link/${name}`,
  };
}
