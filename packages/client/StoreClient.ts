export function createZStoreClient(
  zStoreProtocol: string,
  zStoreOrigin: string,
  zStorePath: string,
  zStoreSchema: any,
  zStoreData: any
) {
  function createAccessor(name: string) {
    function use() {}
    async function get() {}

    return { use, get };
  }
  return { createAccessor };
}
