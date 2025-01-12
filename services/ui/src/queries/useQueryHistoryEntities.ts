import { PowerPiApi } from "@powerpi/common-api";
import { useMemo } from "react";
import _ from "underscore";
import { Query, useQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function entitiesQuery(api: PowerPiApi): Query<{ entity: string }[]> {
    return {
        queryKey: QueryKeyFactory.historyEntities,
        queryFn: () => api.getHistoryEntities(undefined),
        staleTime: 10 * 60 * 1000,
    };
}

export default function useQueryHistoryEntities() {
    const { data, ...query } = useQuery(entitiesQuery);

    const entities = useMemo(() => _(data).map(({ entity }) => entity), [data]);

    return {
        ...query,
        data: entities,
    };
}
