import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import BatteryIcon from "../../components/BatteryIcon";
import Button from "../../components/Button";
import CapabilityButton from "../../components/Capabilities/CapabilityButton";
import DevicePowerToggle from "../../components/DevicePowerToggle";
import HistoryLink from "../../components/HistoryLink";
import Icon from "../../components/Icon";
import Message from "../../components/Message";
import Panel, { usePanel } from "../../components/Panel";
import Search from "../../components/Search";
import Table from "../../components/Table";
import TableCell from "../../components/TableCell";
import TableRow from "../../components/TableRow";
import Time from "../../components/Time";
import useOptionalRoute from "../../routing/useOptionalRoute";
import useDeviceFilter from "./useDeviceFilter";

const DevicePage = () => {
    const { t } = useTranslation();

    const enabled = useOptionalRoute();

    const { state, devices, total, dispatch } = useDeviceFilter();
    const { open: filterOpen, handleToggle: handleFilterToggle } = usePanel();

    const handleSearch = useCallback(
        (search: string) => dispatch({ type: "Search", search }),
        [dispatch],
    );

    const { showingInvisible, showingBattery } = useMemo(
        () => ({
            showingInvisible: devices.findIndex((device) => !device.visible) !== -1,
            showingBattery: devices.findIndex((device) => (device.batterySince ?? 0) > 0) !== -1,
        }),
        [devices],
    );

    return (
        <>
            <div className="w-full flex gap-1 items-center">
                <Button
                    icon="filter"
                    aria-label={t(filterOpen ? "common.close filter" : "common.open filter")}
                    onClick={handleFilterToggle}
                />

                <Search
                    placeholder={t("pages.devices.search for devices")}
                    value={state.search}
                    aria-label={t("pages.devices.search for devices")}
                    onSearch={handleSearch}
                />
            </div>

            <Panel open={filterOpen}>Filters</Panel>

            {total === 0 && <Message translation="pages.devices" type="empty" />}
            {total !== 0 && devices.length === 0 && (
                <Message translation="pages.devices" type="filtered" count={total} />
            )}

            {devices.length !== 0 && (
                <div className="flex-1 overflow-y-auto overflow-x-visible">
                    <Table grow={false}>
                        <tbody>
                            {devices.map((device) => (
                                <TableRow key={device.name}>
                                    {showingInvisible && (
                                        <TableCell width="icon">
                                            <Icon icon={device.visible ? "visible" : "invisible"} />
                                        </TableCell>
                                    )}

                                    <TableCell width="icon">
                                        <CapabilityButton device={device} />
                                    </TableCell>

                                    {showingBattery && (
                                        <TableCell width="icon">
                                            {device.battery != null && (
                                                <BatteryIcon device={device} />
                                            )}
                                        </TableCell>
                                    )}

                                    <TableCell>{device.display_name ?? device.name}</TableCell>

                                    <TableCell width="button">
                                        <div className="flex justify-center">
                                            <DevicePowerToggle device={device} />
                                        </div>
                                    </TableCell>

                                    <TableCell width="time">
                                        <Time time={device.since} data-tooltip-place="left" />
                                    </TableCell>

                                    {enabled?.history && (
                                        <TableCell width="icon">
                                            <HistoryLink device={device} />
                                        </TableCell>
                                    )}
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
