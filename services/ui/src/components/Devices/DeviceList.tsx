import { faEye, faEyeSlash, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { Fragment, useMemo } from "react";
import _ from "underscore";
import useNarrow from "../../hooks/narrow";
import { useGetDevices } from "../../hooks/useGetDevices";
import "../../util";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import BatteryIcon from "../Components/BatteryIcon";
import CapabilityDialog from "../Components/CapabilityDialog";
import DevicePowerButton from "../Components/DevicePowerButton";
import FilterDrawer from "../Components/FilterDrawer";
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
        categories,
        onClear,
        filteredCount,
        onTypeChange,
        onLocationChange,
        onCategoryChange,
        onVisibleChange,
        onSearchChange,
    } = useDeviceFilter(devices);

    const { showingHidden, showingBattery } = useMemo(
        () => ({
            showingHidden: !filters.visible || !String.isNullOrWhitespace(filters.search),
            showingBattery: _(filtered ?? []).any((device) => (device.batterySince ?? 0) > 0),
        }),
        [filtered, filters.search, filters.visible],
    );

    const { isNarrow } = useNarrow();

    return (
        <>
            <div className={styles.list}>
                <Loading loading={isDevicesLoading}>
                    <List>
                        <SearchBox
                            placeholder="Search for devices"
                            value={filters.search}
                            onChange={onSearchChange}
                        />

                        {filtered && filtered.length > 0 ? (
                            <div
                                className={classNames(styles.table, {
                                    [styles.hidden]: showingHidden,
                                    [styles.battery]: showingBattery,
                                    [styles.narrow]: isNarrow,
                                })}
                            >
                                {filtered.map((device, i) => {
                                    const classes = (classname: string) =>
                                        classNames(styles.cell, classname, {
                                            [styles.even]: i % 2 === 0,
                                            [styles.hidden]: !device.visible,
                                        });

                                    return (
                                        <Fragment key={device.name}>
                                            {showingHidden && (
                                                <div className={classes(styles.icon)}>
                                                    <FontAwesomeIcon
                                                        title={`This device is ${
                                                            device.visible ? "visible" : "hidden"
                                                        }`}
                                                        icon={device.visible ? faEye : faEyeSlash}
                                                    />
                                                </div>
                                            )}

                                            <div className={classes(styles.icon)}>
                                                <CapabilityDialog device={device} />
                                            </div>

                                            {showingBattery && (
                                                <div className={classes(styles.icon)}>
                                                    <BatteryIcon sensor={device} />
                                                </div>
                                            )}

                                            <div className={classes(styles.title)}>
                                                {device.display_name ?? device.name}
                                            </div>

                                            <div className={classes(styles.state)}>
                                                <DevicePowerButton device={device} />
                                            </div>

                                            <div className={classes(styles.since)}>
                                                {device.since && device.since > -1 && (
                                                    <AbbreviatingTime date={device.since} />
                                                )}
                                            </div>

                                            <div className={classes(styles.history)}>
                                                <HistoryLink entity={device.name} type="device" />
                                            </div>
                                        </Fragment>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                <div>
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
                                </div>
                            </>
                        )}
                    </List>
                </Loading>
            </div>

            <FilterDrawer
                filters={[
                    {
                        id: "Filters",
                        icon: faSliders,
                        content: (
                            <DeviceFilter
                                filters={filters}
                                types={types}
                                locations={locations}
                                categories={categories}
                                onTypeChange={onTypeChange}
                                onLocationChange={onLocationChange}
                                onCategoryChange={onCategoryChange}
                                onVisibleChange={onVisibleChange}
                                onClear={onClear}
                            />
                        ),
                    },
                ]}
            />
        </>
    );
};
export default DeviceList;
