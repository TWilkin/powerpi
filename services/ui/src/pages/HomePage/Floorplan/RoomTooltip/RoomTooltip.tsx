import { Metric, Sensor } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import Tooltip from "../../../../components/Tooltip";
import useSensors from "../useSensors";
import RoomTooltipRow from "./RoomTooltipRow";
import generateRoomTooltipId from "./generateRoomTooltipId";

type RoomTooltipProps = {
    name: string;

    floor: string;

    room: string;

    sensors: Sensor[];
};

/** Component to display a tooltip for a room containing the current state of all of its sensors. */
const RoomTooltip = ({ name, floor, room, sensors }: RoomTooltipProps) => {
    const showingBattery = useMemo(
        () => sensors.findIndex((sensor) => (sensor.batterySince ?? 0) > 0) !== -1,
        [sensors],
    );

    const sortedSensors = useSensors(sensors);

    return (
        <Tooltip id={generateRoomTooltipId(floor, room)} place="top" className="whitespace-nowrap">
            <h3>{name}</h3>

            <div
                className={classNames("grid auto-rows-auto items-center", {
                    "grid-cols-[18px_18px_auto_auto_9ch]": showingBattery,
                    "grid-cols-[18px_auto_auto_9ch]": !showingBattery,
                })}
            >
                {sortedSensors
                    .filter((sensor) => sensor.data && Object.hasOwn(sensor.data, sensor.type))
                    .map((sensor) => (
                        <RoomTooltipRow
                            key={sensor.name}
                            type={sensor.type as keyof Metric}
                            sensor={sensor}
                            showingBattery={showingBattery}
                        />
                    ))}
            </div>
        </Tooltip>
    );
};
export default RoomTooltip;
