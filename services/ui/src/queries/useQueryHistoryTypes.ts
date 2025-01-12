import { PowerPiApi } from "@powerpi/common-api";
import { useMemo } from "react";
import _ from "underscore";
import { Query, useQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function typesQuery(api: PowerPiApi): Query<{ type: string }[]> {
    return {
        queryKey: QueryKeyFactory.historyTypes,
        queryFn: api.getHistoryTypes,
        staleTime: 10 * 60 * 1000,
    };
}

export default function useQueryHistoryTypes() {
    const { data, ...query } = useQuery(typesQuery);

    const types = useMemo(() => _(data).map(({ type }) => type), [data]);

    return {
        ...query,
        data: types,
    };
}
