import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Search from "../../components/Search";
import useDeviceFilter from "./useDeviceFilter";

const DevicePage = () => {
    const { t } = useTranslation();

    const { state, devices, dispatch } = useDeviceFilter();

    const handleSearch = useCallback(
        (search: string) => dispatch({ type: "Search", search }),
        [dispatch],
    );

    return (
        <>
            <Search
                placeholder={t("pages.devices.search for devices")}
                value={state.search}
                aria-label={t("pages.devices.search for devices")}
                onSearch={handleSearch}
            />

            {JSON.stringify(devices)}
        </>
    );
};
export default DevicePage;
