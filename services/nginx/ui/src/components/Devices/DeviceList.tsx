import { faEye, faEyeSlash, faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useGetDevices } from "../../hooks/devices";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import DeviceIcon from "../Components/DeviceIcon";
import DevicePowerButton from "../Components/DevicePowerButton";
import Filter from "../Components/Filter";
import List from "../Components/List";
import Loading from "../Components/Loading";
import Message from "../Components/Message";
import SearchBox from "../Components/SearchBox";
import DeviceFilter from "./DeviceFilter";
import styles from "./DeviceList.module.scss";
import useDeviceFilter from "./useDeviceFilter";

const DeviceList = () => {
    const { isDevicesLoading, isDevicesError, devices } = useGetDevices();

    const { filters, filtered, types, onClear, onTypeChange, onVisibleChange, onSearchChange } =
        useDeviceFilter(devices);

    return (
        <>
            <Filter onClear={onClear}>
                <DeviceFilter
                    filters={filters}
                    types={types}
                    onTypeChange={onTypeChange}
                    onVisibleChange={onVisibleChange}
                />
            </Filter>

            <div className={styles.list}>
                <Loading loading={isDevicesLoading}>
                    <SearchBox
                        placeholder="Search for devices"
                        value={filters.search}
                        onChange={onSearchChange}
                    />

                    <List>
                        <table>
                            <tbody>
                                {filtered && filtered.length > 0 ? (
                                    filtered.map((device) => (
                                        <tr
                                            key={device.name}
                                            className={classNames(styles.device, {
                                                [styles.hidden]: !device.visible,
                                            })}
                                            title={`Device ${device.name} is currently ${device.state}.`}
                                        >
                                            {(!filters.visible || filters.search) && (
                                                <td>
                                                    <FontAwesomeIcon
                                                        title={`This device is ${
                                                            device.visible ? "visible" : "hidden"
                                                        }`}
                                                        icon={device.visible ? faEye : faEyeSlash}
                                                    />
                                                </td>
                                            )}

                                            <td>
                                                <DeviceIcon type={device.type} />
                                            </td>

                                            <td>{device.display_name ?? device.name}</td>

                                            <td className={styles.state}>
                                                <DevicePowerButton device={device} />
                                            </td>

                                            <td>
                                                {device.since && device.since > -1 && (
                                                    <AbbreviatingTime date={device.since} />
                                                )}
                                            </td>

                                            <td className={styles.history}>
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
                                            {isDevicesError ? (
                                                <Message
                                                    error
                                                    message="An error occurred loading the devices."
                                                />
                                            ) : (
                                                <Message message="No devices." />
                                            )}
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
