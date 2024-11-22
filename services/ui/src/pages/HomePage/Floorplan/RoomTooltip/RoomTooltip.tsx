import { Sensor } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import _ from "underscore";
import Tooltip from "../../../../components/Tooltip";
import getSensorType from "../../../../utils/getSensorType";
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

    const sortedSensors = useMemo(
        () =>
            _(sensors).sortBy((sensor) =>
                (getSensorType(sensor.type) ?? sensor.type).toLocaleLowerCase(),
            ),
        [sensors],
    );

    return (
        <Tooltip id={generateRoomTooltipId(floor, room)} place="top" className="whitespace-nowrap">
            <h3>{name}</h3>

            <div
                className={classNames("grid auto-rows-auto", {
                    "grid-cols-[18px_18px_auto_auto_9ch]": showingBattery,
                    "grid-cols-[18px_auto_auto_9ch]": !showingBattery,
                })}
            >
                {sortedSensors.map((sensor) => (
                    <RoomTooltipRow
                        key={sensor.name}
                        sensor={sensor}
                        showingBattery={showingBattery}
                    />
                ))}
            </div>
        </Tooltip>
    );
};
export default RoomTooltip;
