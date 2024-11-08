import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Message from "../../components/Message";
import Search from "../../components/Search";
import useDeviceFilter from "./useDeviceFilter";

const DevicePage = () => {
    const { t } = useTranslation();

    const { state, devices, total, dispatch } = useDeviceFilter();

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

            {total === 0 && <Message page="pages.devices" type="empty" />}
            {total !== 0 && devices.length === 0 && (
                <Message page="pages.devices" type="filtered" count={total} />
            )}

            {devices.length !== 0 && JSON.stringify(devices)}
        </>
    );
};
export default DevicePage;
