export function defineKeySource(label: string) {
  const prefix = `${label}-${Date.now()}-`;
  let index = Math.floor(Math.random() * 1000);
  return () => {
    index += 1;
    return `${prefix}${index}`;
  };
}
