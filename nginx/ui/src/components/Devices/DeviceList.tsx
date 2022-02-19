import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PowerPiApi } from "@powerpi/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetDevices } from "../../hooks/devices";
import { DeviceIcon, DevicePowerButton, Filter, List } from "../Components";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import Loading from "../Components/Loading";
import DeviceFilter, { Filters } from "./DeviceFilter";
import styles from "./Devices.module.scss";

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

            <div className={styles["device-list"]}>
                <Loading loading={isDevicesLoading}>
                    <List>
                        <table>
                            <tbody>
                                {filtered && filtered.length > 0 ? (
                                    filtered.map((device) => (
                                        <tr
                                            key={device.name}
                                            className={styles.device}
                                            title={`Device ${device.name} is currently ${device.state}.`}
                                        >
                                            <td>
                                                <DeviceIcon type={device.type} />
                                            </td>

                                            <td>{device.display_name ?? device.name}</td>

                                            <td className={styles["device-state"]}>
                                                <DevicePowerButton api={api} device={device} />
                                            </td>

                                            <td>
                                                {device.since && device.since > -1 && (
                                                    <AbbreviatingTime date={device.since} />
                                                )}
                                            </td>

                                            <td>
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
                    </List>
                </Loading>
            </div>
        </>
    );
};
export default DeviceList;
