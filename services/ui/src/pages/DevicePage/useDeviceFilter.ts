import { Device } from "@powerpi/common-api";
import { useCallback, useMemo, useReducer } from "react";
import { chain as _ } from "underscore";
import useQueryDevices from "../../queries/useQueryDevices";

type DeviceFilterState = {
    search: string;

    types: string[];

    locations: (string | undefined)[];

    visibleOnly: boolean;
};

const initialDeviceFilterState: Omit<DeviceFilterState, "types" | "locations"> = {
    search: "",

    visibleOnly: true,
};

/** Hook to filter the device list based on the user's filter selections.
 * @return The filter state, filtered device list and the filter state dispatch function.
 */
export default function useDeviceFilter() {
    const { data } = useQueryDevices();

    const types = useMemo(
        () =>
            _(data)
                .map((device) => device.type)
                .unique()
                .sortBy((type) => type.toLocaleLowerCase())
                .value(),
        [data],
    );

    const locations = useMemo(
        () =>
            _(data)
                .map((device) => device.location)
                .unique()
                .sortBy((location) => location?.toLocaleLowerCase())
                .value(),
        [data],
    );

    const [state, dispatch] = useReducer(reducer, { types, locations }, initialiser);

    const clear = useCallback(
        () => dispatch({ type: "Clear", initialState: initialiser({ types, locations }) }),
        [locations, types],
    );

    const filtered = useMemo(() => filter(state, data), [data, state]);

    return {
        state,
        devices: filtered,
        types,
        locations,
        total: data.length,
        dispatch,
        clear,
    };
}

type SearchAction = { type: "Search"; search: string };

type TypesAction = { type: "Types"; types: string[] };
type LocationsAction = { type: "Locations"; locations: string[] };

type VisibleOnlyAction = { type: "VisibleOnly"; visibleOnly: boolean };

type ClearAction = { type: "Clear"; initialState: DeviceFilterState };

type DeviceFilterAction =
    | SearchAction
    | TypesAction
    | LocationsAction
    | VisibleOnlyAction
    | ClearAction;

function reducer(state: DeviceFilterState, action: DeviceFilterAction) {
    function update(newState: Partial<DeviceFilterState>) {
        return { ...state, ...newState };
    }

    switch (action.type) {
        case "Search":
            return update({ search: action.search });

        case "Types":
            return update({ types: action.types });

        case "Locations":
            return update({ locations: action.locations });

        case "VisibleOnly":
            return update({ visibleOnly: action.visibleOnly });

        case "Clear":
            return action.initialState;

        default:
            throw Error("Unknown action");
    }
}

type InitialiserParams = Pick<DeviceFilterState, "types" | "locations">;

function initialiser(params: InitialiserParams): DeviceFilterState {
    return {
        ...initialDeviceFilterState,
        ...params,
    };
}

function filter(state: DeviceFilterState, devices: Device[]) {
    // the search overrides any other filters
    const trimmedSearch = state.search.trim();
    if (trimmedSearch !== "") {
        const search = trimmedSearch.toLocaleLowerCase();

        return devices.filter(
            (device) =>
                device.display_name?.toLocaleLowerCase().includes(search) ||
                device.name.toLocaleLowerCase().includes(search),
        );
    }

    // types
    devices = devices.filter((device) => state.types.includes(device.type));

    // locations
    devices = devices.filter((device) => state.locations.includes(device.location));

    // filter invisible devices?
    if (state.visibleOnly) {
        devices = devices.filter((device) => device.visible);
    }

    return devices;
}
