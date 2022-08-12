import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import DeviceIcon from "../Components/DeviceIcon";
import DevicePowerButton from "../Components/DevicePowerButton";
import Filter from "../Components/Filter";
import List from "../Components/List";
import Loading from "../Components/Loading";
import Message from "../Components/Message";
import SearchBox from "../Components/SearchBox/SearchBox";
import DeviceFilter from "./DeviceFilter";
import styles from "./DeviceList.module.scss";
import useDeviceFilter from "./useDeviceFilter";

const DeviceList = () => {
    const {
        filters,
        isDevicesLoading,
        isDevicesError,
        devices,
        types,
        onTypeChange,
        onSearchChange,
    } = useDeviceFilter();

    return (
        <>
            <Filter>
                <DeviceFilter filters={filters} types={types} onTypeChange={onTypeChange} />
            </Filter>

            <div className={styles.list}>
                <Loading loading={isDevicesLoading}>
                    <SearchBox placeholder="Search for devices" onChange={onSearchChange} />

                    <List>
                        <table>
                            <tbody>
                                {devices && devices.length > 0 ? (
                                    devices.map((device) => (
                                        <tr
                                            key={device.name}
                                            className={styles.device}
                                            title={`Device ${device.name} is currently ${device.state}.`}
                                        >
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
