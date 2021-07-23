import { PowerPiApi } from "powerpi-common-api";
import { useQuery, UseQueryResult } from "react-query";

export function useGetHistoryFilters(api: PowerPiApi) {
  const actions = useGetHistoryFilter("actions", api.getHistoryActions);
  const entities = useGetHistoryFilter("entities", api.getHistoryEntities);
  const types = useGetHistoryFilter("types", api.getHistoryTypes);

  return {
    actions: extractResult(actions, "action"),
    entities: extractResult(entities, "entity"),
    types: extractResult(types, "type")
  };
}

function useGetHistoryFilter<TFilter>(
  name: string,
  method: () => Promise<TFilter[]>
) {
  return useQuery(["history", name], method);
}

function extractResult<TRecord>(
  result: UseQueryResult<TRecord[], unknown>,
  prop: keyof TRecord
) {
  return {
    isLoading: result.isLoading,
    isError: result.isError,
    data:
      result.data && result.data.length > 0
        ? result.data.map((record) => record[prop])
        : []
  };
}
