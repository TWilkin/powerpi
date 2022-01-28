import { Sensor } from "@powerpi/api";
import React from "react";
import ReactTooltip from "react-tooltip";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import FormattedValue from "../Components/FormattedValue";
import SensorIcon from "../Components/SensorIcon";

interface TooltipProps {
    title: string;
    location: string;
    floor: string;
    sensors: Sensor[];
}

const Tooltip = ({ title, location, floor, sensors }: TooltipProps) => (
    <ReactTooltip id={`${floor}${location}`} clickable>
        <h3>{title}</h3>

        {sensors.map((sensor) => (
            <p key={sensor.name}>
                <span>
                    <SensorIcon type={sensor.type} /> <strong>{sensor.type}:</strong>{" "}
                    {sensor.value !== undefined && sensor.unit ? (
                        <FormattedValue value={sensor.value} unit={sensor.unit} />
                    ) : (
                        sensor.state
                    )}
                </span>

                <AbbreviatingTime date={sensor.since} abbreviate />
            </p>
        ))}
    </ReactTooltip>
);
export default Tooltip;
