import { useQuery, UseQueryOptions } from "react-query";
import { SavedConnection, serverGet } from "./Connection";

export function createZStoreClient(
  zStoreProtocol: string,
  zStoreOrigin: string,
  zStorePath: string,
  zStoreSchema: any,
  zStoreData: any
) {
  const connection: SavedConnection = {
    key: "StaticClient",
    name: "StoreClient",
    url: `${zStoreProtocol}${zStoreOrigin}`,
  };

  function createAccessor<FileType>(name: string) {
    async function get(): Promise<FileType> {
      const resp = await serverGet(connection, `.z/${zStorePath}/${name}`);
      return resp.value;
    }
    function use(
      queryOptions?: UseQueryOptions<unknown, unknown, unknown, any>
    ) {
      return useQuery([".zerve-store", zStorePath, name], get, queryOptions);
    }
    return { use, get };
  }
  return { createAccessor };
}
