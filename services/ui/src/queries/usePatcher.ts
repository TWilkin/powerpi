import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { omit } from "underscore";

type Data = { name: string };
type Patch<TData extends Data> = { type: string } & Partial<TData>;

export default function usePatcher<TData extends Data, TPatch extends Patch<TData>>(
    queryKey: QueryKey,
) {
    const queryClient = useQueryClient();

    return useCallback(
        (name: string, patch: TPatch) => {
            queryClient.setQueryData(queryKey, (data: TData[]) => {
                const newData = [...data];

                const index = newData.findIndex((record) => record.name === name);
                if (index >= 0) {
                    newData[index] = { ...newData[index], ...omit(patch, "type") };
                }

                return newData;
            });
        },
        [queryClient, queryKey],
    );
}
