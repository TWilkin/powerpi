import { PowerPiApi, Sensor } from "@powerpi/api";
import React, { useMemo } from "react";
import useGetSensors from "../../hooks/sensors";
import Floorplan from "./Floorplan";
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

    const floorplan = {
        floors: [
            {
                name: "Example",
                rooms: [
                    { name: "Office", width: 300, height: 300 },
                    { name: "Hallway", x: 300, width: 300, height: 300 },
                ],
            },
        ],
    };

    return (
        <div id="home">
            <Floorplan floorplan={floorplan} />

            {Object.keys(sensorsByLocation).map((location) => (
                <Tooltip key={location} location={location} sensors={sensorsByLocation[location]} />
            ))}
        </div>
    );
};
export default Home;
