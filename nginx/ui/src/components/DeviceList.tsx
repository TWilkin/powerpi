import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PowerPiApi } from "@powerpi/api";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetDevices } from "../hooks/devices";
import AbbreviatingTime from "./Components/AbbreviatingTime";
import DeviceFilter, { Filters } from "./DeviceFilter";
import DeviceIcon from "./DeviceIcon";
import DevicePowerButton from "./DevicePowerButton";
import Filter from "./Filter";
import Loading from "./Loading";

interface DeviceListProps {
    api: PowerPiApi;
}

const DeviceList = ({ api }: DeviceListProps) => {
    const [filters, setFilters] = useState<Filters>({ types: [] });

    const { isDevicesLoading, isDevicesError, devices } = useGetDevices(api);

    const filtered = devices?.filter(
        (device) => device.visible && filters.types.includes(device.type)
    );

    return (
        <>
            <Filter>
                <DeviceFilter devices={devices} updateFilters={setFilters} />
            </Filter>

            <div id="device-list">
                <Loading loading={isDevicesLoading}>
                    <div className="list">
                        <table>
                            <tbody>
                                {filtered && filtered.length > 0 ? (
                                    filtered.map((device) => (
                                        <tr
                                            key={device.name}
                                            className="device"
                                            title={`Device ${device.name} is currently ${device.state}.`}
                                        >
                                            <td>
                                                <DeviceIcon type={device.type} />
                                            </td>

                                            <td className="device-name">
                                                {device.display_name ?? device.name}
                                            </td>

                                            <td className="device-state">
                                                <DevicePowerButton api={api} device={device} />
                                            </td>

                                            <td className="device-since">
                                                {device.since && device.since > -1 && (
                                                    <AbbreviatingTime date={device.since} />
                                                )}
                                            </td>

                                            <td className="device-history">
                                                <Link
                                                    to={`/history?type=device&entity=${device.name}`}
                                                >
                                                    <FontAwesomeIcon icon={faHistory} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            {isDevicesError
                                                ? `An error occured when loading the device list`
                                                : `No devices`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Loading>
            </div>
        </>
    );
};
export default DeviceList;
