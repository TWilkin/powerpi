import { Device } from "@powerpi/common-api";
import { useMemo, useReducer } from "react";
import useQueryDevices from "../../queries/useQueryDevices";

type DeviceFilterState = {
    search: string;

    visibleOnly: boolean;
};

const initialDeviceFilterState = {
    search: "",

    visibleOnly: true,
};

/** Hook to filter the device list based on the user's filter selections.
 * @return The filter state, filtered device list and the filter state dispatch function.
 */
export default function useDeviceFilter() {
    const { data } = useQueryDevices();

    const [state, dispatch] = useReducer(reducer, initialDeviceFilterState);

    const filtered = useMemo(() => filter(state, data), [data, state]);

    return {
        state,
        devices: filtered,
        total: data.length,
        dispatch,
    };
}

type SearchAction = { type: "Search"; search: string };

type VisibleOnlyAction = { type: "VisibleOnly"; visibleOnly: boolean };

type ClearAction = { type: "Clear" };

type DeviceFilterAction = SearchAction | VisibleOnlyAction | ClearAction;

function reducer(state: DeviceFilterState, action: DeviceFilterAction) {
    function update(newState: Partial<DeviceFilterState>) {
        return { ...state, ...newState };
    }

    switch (action.type) {
        case "Search":
            return update({ search: action.search });

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

    // filter invisible devices?
    if (state.visibleOnly) {
        devices = devices.filter((device) => device.visible);
    }

    return devices;
}
