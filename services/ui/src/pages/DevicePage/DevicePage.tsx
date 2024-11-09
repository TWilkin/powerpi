import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DeviceIcon from "../../components/DeviceIcon";
import Icon from "../../components/Icon";
import Message from "../../components/Message";
import Search from "../../components/Search";
import Table from "../../components/Table";
import TableCell from "../../components/TableCell";
import TableRow from "../../components/TableRow";
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
                <div className="flex-1 overflow-auto">
                    <Table>
                        <tbody>
                            {devices.map((device) => (
                                <TableRow key={device.name}>
                                    {showingInvisible && (
                                        <TableCell>
                                            <Icon icon={device.visible ? "visible" : "invisible"} />
                                        </TableCell>
                                    )}

                                    <TableCell>
                                        <DeviceIcon type={device.type} />
                                    </TableCell>

                                    <TableCell>{device.display_name ?? device.name}</TableCell>

                                    <TableCell>{JSON.stringify(device)}</TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </>
    );
};
export default DevicePage;
