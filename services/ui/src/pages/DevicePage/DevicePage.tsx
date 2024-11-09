import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DeviceIcon from "../../components/DeviceIcon";
import Icon from "../../components/Icon";
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

    const { showingInvisible } = useMemo(
        () => ({
            showingInvisible: devices.findIndex((device) => !device.visible) !== -1,
        }),
        [devices],
    );

    return (
        <>
            <Search
                placeholder={t("pages.devices.search for devices")}
                value={state.search}
                aria-label={t("pages.devices.search for devices")}
                onSearch={handleSearch}
            />

            {total === 0 && <Message translation="pages.devices" type="empty" />}
            {total !== 0 && devices.length === 0 && (
                <Message translation="pages.devices" type="filtered" count={total} />
            )}

            {devices.length !== 0 && (
                <table>
                    <tbody>
                        {devices.map((device) => (
                            <tr key={device.name}>
                                {showingInvisible && (
                                    <td>
                                        <Icon icon={device.visible ? "visible" : "invisible"} />
                                    </td>
                                )}

                                <td>
                                    <DeviceIcon type={device.type} />
                                </td>

                                <td>{device.display_name ?? device.name}</td>

                                <td>{JSON.stringify(device)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
};
export default DevicePage;
