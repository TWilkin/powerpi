import { Device } from "@powerpi/common-api";
import { useMemo, useReducer } from "react";
import useDevices from "../../queries/useDevices";

type DeviceFilterState = {
    search: string;
};

const initialDeviceFilterState = {
    search: "",
};

/** Hook to filter the device list based on the user's filter selections.
 * @return The filter state, filtered device list and the filter state dispatch function.
 */
export default function useDeviceFilter() {
    const { data } = useDevices();

    const [state, dispatch] = useReducer(reducer, initialDeviceFilterState);

    const filtered = useMemo(() => filter(state, data), [data, state]);

    return {
        state,
        devices: filtered,
        total: data.length ?? 0,
        dispatch,
    };
}

type SearchAction = { type: "Search"; search: string };

type ClearAction = { type: "Clear" };

type DeviceFilterAction = SearchAction | ClearAction;

function reducer(state: DeviceFilterState, action: DeviceFilterAction) {
    function update(newState: Partial<DeviceFilterState>) {
        return { ...state, ...newState };
    }

    switch (action.type) {
        case "Search":
            return update({ search: action.search });

        case "Clear":
            return { ...initialDeviceFilterState };

        default:
            throw Error("Unknown action");
    }
}

function filter(state: DeviceFilterState, devices: Device[]) {
    // the search disables any other filters
    const trimmedSearch = state.search.trim();
    if (trimmedSearch !== "") {
        const search = trimmedSearch.toLocaleLowerCase();

        return devices.filter(
            (device) =>
                device.display_name?.toLocaleLowerCase().includes(search) ||
                device.name.toLocaleLowerCase().includes(search),
        );
    }

    return devices;
}
