import { useQuery, UseQueryOptions } from "react-query";
import { Connection, serverGet } from "./ClientConnection";

export function createZStoreClient(
  zStoreProtocol: string,
  zStoreOrigin: string,
  zStorePath: string,
  zStoreSchema: any,
  zStoreData: any,
) {
  const connection: Connection = {
    key: "StaticClient",
    name: "StoreClient",
    url: `${zStoreProtocol}${zStoreOrigin}`,
  };

  function createAccessor<EntryType>(name: string) {
    async function get(): Promise<EntryType> {
      const resp = await serverGet(
        connection.url,
        `${zStorePath}/state/${name}`,
      );
      return resp.value;
    }
    function use(
      queryOptions?: UseQueryOptions<
        // union with undefined here is not desirable. but otherwise RQ data type does not indicate that the value is undefined during loading.. wtf?
        EntryType | undefined,
        string | undefined,
        EntryType | undefined,
        any
      >,
    ) {
      return useQuery<EntryType | undefined, string | undefined>(
        [".zerve-store", zStorePath, name],
        get,
        queryOptions,
      );
    }
    return { use, get };
  }
  return { createAccessor };
}
