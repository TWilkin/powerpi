import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useGetDevices } from "../../hooks/devices";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import DeviceIcon from "../Components/DeviceIcon";
import DevicePowerButton from "../Components/DevicePowerButton";
import Filter from "../Components/Filter";
import HistoryLink from "../Components/HistoryLink";
import List from "../Components/List";
import Loading from "../Components/Loading";
import Message from "../Components/Message";
import SearchBox from "../Components/SearchBox";
import DeviceFilter from "./DeviceFilter";
import styles from "./DeviceList.module.scss";
import useDeviceFilter from "./useDeviceFilter";

const DeviceList = () => {
    const { isDevicesLoading, isDevicesError, devices } = useGetDevices();

    const {
        filters,
        filtered,
        types,
        locations,
        onClear,
        filteredCount,
        onTypeChange,
        onLocationChange,
        onVisibleChange,
        onSearchChange,
    } = useDeviceFilter(devices);

    return (
        <>
            <Filter onClear={onClear}>
                <DeviceFilter
                    filters={filters}
                    types={types}
                    locations={locations}
                    onTypeChange={onTypeChange}
                    onLocationChange={onLocationChange}
                    onVisibleChange={onVisibleChange}
                />
            </Filter>

            <div className={styles.list}>
                <Loading loading={isDevicesLoading}>
                    <List>
                        <SearchBox
                            placeholder="Search for devices"
                            value={filters.search}
                            onChange={onSearchChange}
                        />

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
                                                <HistoryLink entity={device.name} type="device" />
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
                                            ) : filteredCount !== 0 ? (
                                                <Message
                                                    message={`Filtered ${filteredCount} device${
                                                        filteredCount > 1 ? "s" : ""
                                                    }.`}
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
