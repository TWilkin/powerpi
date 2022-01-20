import { Sensor } from "@powerpi/api";
import React from "react";
import ReactTooltip from "react-tooltip";
import FormattedValue from "../Components/FormattedValue";
import SensorIcon from "../Components/SensorIcon";

interface TooltipProps {
    location: string;
    sensors: Sensor[];
}

const Tooltip = ({ location, sensors }: TooltipProps) => (
    <ReactTooltip id={location} clickable={true}>
        <h3>{location}</h3>

        {sensors.map((sensor) => (
            <p key={sensor.name}>
                <SensorIcon type={sensor.type} /> <strong>{sensor.type}:</strong>{" "}
                {sensor.value !== undefined && sensor.unit ? (
                    <FormattedValue value={sensor.value} unit={sensor.unit} />
                ) : (
                    sensor.state
                )}
            </p>
        ))}
    </ReactTooltip>
);
export default Tooltip;
