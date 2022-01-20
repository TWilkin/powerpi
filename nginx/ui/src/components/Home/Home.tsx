import { PowerPiApi, Sensor } from "@powerpi/api";
import React, { useMemo } from "react";
import ReactTooltip from "react-tooltip";
import useGetSensors from "../../hooks/sensors";

interface HomeProps {
    api: PowerPiApi;
}

const Home = ({ api }: HomeProps) => {
    const { sensors } = useGetSensors(api);

    const sensorsByLocation = useMemo(
        () =>
            sensors?.reduce((dict, sensor) => {
                if (!(sensor.location in dict)) {
                    dict[sensor.location] = [];
                }

                dict[sensor.location].push(sensor);

                return dict;
            }, {} as { [key: string]: Sensor[] }) ?? {},
        [sensors]
    );

    return (
        <div id="home">
            <svg viewBox="0 0 600 300" preserveAspectRatio="true">
                <g>
                    <title>Home</title>
                    <rect id="LivingRoom" width="300" height="300" data-tip data-for="LivingRoom" />
                    <rect
                        id="Kitchen"
                        x="300"
                        width="300"
                        height="300"
                        data-tip
                        data-for="Office"
                    />
                </g>
            </svg>

            {Object.keys(sensorsByLocation).map((location) => (
                <Tooltip location={location} sensors={sensorsByLocation[location]} />
            ))}
        </div>
    );
};
export default Home;

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
