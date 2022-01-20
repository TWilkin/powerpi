import { Sensor } from "@powerpi/api";
import React from "react";
import ReactTooltip from "react-tooltip";

interface TooltipProps {
    location: string;
    sensors: Sensor[];
}

const Tooltip = ({ location, sensors }: TooltipProps) => (
    <ReactTooltip id={location} clickable={true}>
        <h3>{location}</h3>

        {sensors.map((sensor) => (
            <p key={sensor.name}>
                {sensor.type}:{" "}
                {sensor.value !== undefined && sensor.unit
                    ? `${sensor.value} ${sensor.unit}`
                    : sensor.state}
            </p>
        ))}
    </ReactTooltip>
);
export default Tooltip;
