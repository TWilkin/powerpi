import { PowerPiApi } from "@powerpi/common-api";
import { useMemo } from "react";
import _ from "underscore";
import { Query, useQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function actionsQuery(api: PowerPiApi): Query<{ action: string }[]> {
    return {
        queryKey: QueryKeyFactory.historyActions,
        queryFn: () => api.getHistoryActions(undefined),
        staleTime: 10 * 60 * 1000,
    };
}

export default function useQueryHistoryActions() {
    const { data, ...query } = useQuery(actionsQuery);

    const actions = useMemo(() => _(data).map(({ action }) => action), [data]);

    return {
        ...query,
        data: actions,
    };
}
