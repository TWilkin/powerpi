import { useCallback } from "react";
import Search from "../../components/Search";
import useDeviceFilter from "./useDeviceFilter";

const DevicePage = () => {
    const { state, devices, dispatch } = useDeviceFilter();

    const handleSearch = useCallback(
        (search: string) => dispatch({ type: "Search", search }),
        [dispatch],
    );

    return (
        <>
            <Search placeholder="Search for devices" value={state.search} onSearch={handleSearch} />

            {JSON.stringify(devices)}
        </>
    );
};
export default DevicePage;
