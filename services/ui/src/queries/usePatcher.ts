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
                    newData[index] = deepExtend(
                        newData[index],
                        omit(patch, "type") as Partial<TData>,
                    );
                }

                return newData;
            });
        },
        [queryClient, queryKey],
    );
}

function deepExtend<TDataType>(target: TDataType, source: Partial<TDataType>) {
    const result = { ...target };

    for (const prop in source) {
        if (source[prop] != null && Object.hasOwn(source, prop)) {
            if (target[prop] && typeof source[prop] === "object") {
                result[prop] = deepExtend(result[prop], source[prop]);
            } else {
                result[prop] = source[prop];
            }
        }
    }

    return result;
}
