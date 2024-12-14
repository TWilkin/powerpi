import { Device } from "@powerpi/common-api";
import { useMemo, useReducer } from "react";
import { chain as _ } from "underscore";
import useQueryDevices from "../../queries/useQueryDevices";

type FilterList = {
    all: boolean;

    list: string[];
};

type DeviceFilterState = {
    search: string;

    types: FilterList;

    visibleOnly: boolean;
};

const initialDeviceFilterState = {
    search: "",

    types: {
        all: true,
        list: [],
    },

    visibleOnly: true,
};

/** Hook to filter the device list based on the user's filter selections.
 * @return The filter state, filtered device list and the filter state dispatch function.
 */
export default function useDeviceFilter() {
    const { data } = useQueryDevices();

    const [state, dispatch] = useReducer(reducer, initialDeviceFilterState);

    const filtered = useMemo(() => filter(state, data), [data, state]);

    const types = useMemo(
        () =>
            _(data)
                .map((device) => device.type)
                .unique()
                .sortBy((type) => type.toLocaleLowerCase())
                .value(),
        [data],
    );

    return {
        state,
        devices: filtered,
        types,
        total: data.length,
        dispatch,
    };
}

type SearchAction = { type: "Search"; search: string };

type TypeAction = { type: "Types"; all: boolean; types: string[] };

type VisibleOnlyAction = { type: "VisibleOnly"; visibleOnly: boolean };

type ClearAction = { type: "Clear" };

type DeviceFilterAction = SearchAction | TypeAction | VisibleOnlyAction | ClearAction;

function reducer(state: DeviceFilterState, action: DeviceFilterAction) {
    function update(newState: Partial<DeviceFilterState>) {
        return { ...state, ...newState };
    }

    switch (action.type) {
        case "Search":
            return update({ search: action.search });

        case "Types":
            return update({ types: { all: action.all, list: action.types } });

        case "VisibleOnly":
            return update({ visibleOnly: action.visibleOnly });

        case "Clear":
            return { ...initialDeviceFilterState };

        default:
            throw Error("Unknown action");
    }
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
    if (!state.types.all) {
        devices = devices.filter((device) => state.types.list.includes(device.type));
    }

    // filter invisible devices?
    if (state.visibleOnly) {
        devices = devices.filter((device) => device.visible);
    }

    return devices;
}
