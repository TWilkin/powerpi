import { useCallback, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import useEntity from "./useEntity";

type HistoryFilterState = {
    type: string | undefined;

    entity: string | undefined;

    action: string | undefined;

    start: Date | undefined;
};

const initialHistoryFilterState: Omit<HistoryFilterState, "entity"> = {
    type: undefined,

    action: undefined,

    start: undefined,
};

/** Hook to filter the history based on the user's filter selections.
 * @return The filter state and the filter state dispatch function.
 */
export default function useHistoryFilter() {
    // Get the current entity from the URL (if there is one)
    const entity = useEntity();

    const reducer = useHistoryReducer();
    const [state, dispatch] = useReducer(reducer, { entity }, initialiser);

    const clear = useCallback(
        () => dispatch({ type: "Clear", initialState: initialiser({ entity: undefined }) }),
        [],
    );

    return {
        state,
        dispatch,
        clear,
    };
}

type TypeAction = { type: "Type"; _type: string | undefined };
type EntityAction = { type: "Entity"; entity: string | undefined };
type ActionAction = { type: "Action"; action: string | undefined };

type StartAction = { type: "Start"; start: Date | undefined };

type ClearAction = { type: "Clear"; initialState: HistoryFilterState };

type HistoryFilterAction = TypeAction | EntityAction | ActionAction | StartAction | ClearAction;

function useHistoryReducer() {
    const navigate = useNavigate();

    return useCallback(
        (state: HistoryFilterState, action: HistoryFilterAction): HistoryFilterState => {
            function update(newState: Partial<HistoryFilterState>) {
                return { ...state, ...newState };
            }

            switch (action.type) {
                case "Type":
                    return update({ type: action._type });

                case "Entity":
                    navigate(RouteBuilder.build(Route.Root, Route.History, action.entity));
                    return update({ entity: action.entity });

                case "Action":
                    return update({ action: action.action });

                case "Start":
                    return update({ start: action.start });

                case "Clear":
                    navigate(
                        RouteBuilder.build(Route.Root, Route.History, action.initialState.entity),
                    );
                    return action.initialState;

                default:
                    throw Error("Unknown action");
            }
        },
        [navigate],
    );
}

type InitialiserParams = Pick<HistoryFilterState, "entity">;

function initialiser(params: InitialiserParams): HistoryFilterState {
    return {
        ...initialHistoryFilterState,
        entity: params.entity,
    };
}
