import { PowerPiApi, Sensor } from "@powerpi/api";
import React, { useMemo } from "react";
import useGetSensors from "../../hooks/sensors";
import Tooltip from "./Tooltip";

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
            <div id="layout">
                <svg viewBox="0 0 600 300" preserveAspectRatio="true">
                    <g>
                        <title>Home</title>
                        <rect
                            id="LivingRoom"
                            width="300"
                            height="300"
                            data-tip
                            data-for="Hallway"
                        />
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
            </div>

            {Object.keys(sensorsByLocation).map((location) => (
                <Tooltip location={location} sensors={sensorsByLocation[location]} />
            ))}
        </div>
    );
};
export default Home;
