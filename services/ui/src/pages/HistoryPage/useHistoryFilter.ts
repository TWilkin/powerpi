import { useCallback, useEffect, useReducer } from "react";
import useEntity from "./useEntity";

type HistoryFilterState = {
    type: string | undefined;

    entity: string | undefined;

    action: string | undefined;
};

const initialHistoryFilterState: Omit<HistoryFilterState, "entity"> = {
    type: undefined,

    action: undefined,
};

/** Hook to filter the history based on the user's filter selections.
 * @return The filter state and the filter state dispatch function.
 */
export default function useHistoryFilter() {
    const entity = useEntity();

    const [state, dispatch] = useReducer(reducer, { entity }, initialiser);

    const clear = useCallback(
        () => dispatch({ type: "Clear", initialState: initialiser({ entity }) }),
        [entity],
    );

    // if the entity changes, update the filter state
    useEffect(() => {
        if (entity !== state.entity) {
            dispatch({ type: "Entity", entity });
        }
    }, [entity, state.entity]);

    return {
        state,
        dispatch,
        clear,
    };
}

type TypeAction = { type: "Type"; _type: string | undefined };
type EntityAction = { type: "Entity"; entity: string | undefined };
type ActionAction = { type: "Action"; action: string | undefined };

type ClearAction = { type: "Clear"; initialState: HistoryFilterState };

type HistoryFilterAction = TypeAction | EntityAction | ActionAction | ClearAction;

function reducer(state: HistoryFilterState, action: HistoryFilterAction): HistoryFilterState {
    function update(newState: Partial<HistoryFilterState>) {
        return { ...state, ...newState };
    }

    switch (action.type) {
        case "Type":
            return update({ type: action._type });

        case "Entity":
            return update({ entity: action.entity });

        case "Action":
            return update({ action: action.action });

        case "Clear":
            return action.initialState;

        default:
            throw Error("Unknown action");
    }
}

type InitialiserParams = Pick<HistoryFilterState, "entity">;

function initialiser(params: InitialiserParams): HistoryFilterState {
    return {
        ...initialHistoryFilterState,
        entity: params.entity,
    };
}
