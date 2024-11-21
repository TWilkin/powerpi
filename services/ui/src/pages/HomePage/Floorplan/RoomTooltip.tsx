import { Sensor } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import BatteryIcon from "../../../components/BatteryIcon";
import SensorIcon from "../../../components/SensorIcon";
import Tooltip from "../../../components/Tooltip";
import Value from "../../../components/Value";

type RoomTooltipProps = {
    name: string;

    floor: string;

    room: string;

    sensors: Sensor[];
};

const RoomTooltip = ({ name, floor, room, sensors }: RoomTooltipProps) => {
    const showingBattery = useMemo(
        () => sensors.findIndex((sensor) => (sensor.batterySince ?? 0) > 0) !== -1,
        [sensors],
    );

    return (
        <Tooltip id={generateRoomTooltipId(floor, room)} place="top">
            <h3>{name}</h3>

            <div
                className={classNames("grid auto-rows-auto", {
                    "grid-cols-[20px_20px_auto_1fr]": showingBattery,
                    "grid-cols-[20px_auto_1fr]": !showingBattery,
                })}
            >
                {sensors.map((sensor) => (
                    <Fragment key={sensor.name}>
                        <SensorIcon type={sensor.type} state={sensor.state} />

                        {showingBattery &&
                            (sensor.battery != null ? <BatteryIcon device={sensor} /> : <span />)}

                        <p className="px-2">{sensor.display_name}</p>

                        <p>
                            <Value type={sensor.type} value={sensor.value} unit={sensor.unit} />
                        </p>
                    </Fragment>
                ))}
            </div>
        </Tooltip>
    );
};
export default RoomTooltip;

export function generateRoomTooltipId(floor: string, room: string) {
    return `room-tooltip-${floor}-${room}`;
}
