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

    const floorplan = {
        floors: [
            {
                name: "Example",
                rooms: [
                    { name: "Office", width: 300, height: 300 },
                    { name: "Hallway", x: 300, width: 300, height: 300 },
                    { name: "Bedroom", x: 600, width: 300, height: 300 },
                ],
            },
        ],
    };

    const locations = useMemo(
        () =>
            floorplan.floors.reduce((locations, floor) => {
                locations.push(
                    ...floor.rooms.map((room) => ({
                        name: room.name,
                        sensors: sensors?.filter((sensor) => sensor.location === room.name) ?? [],
                    }))
                );

                return locations;
            }, [] as { name: string; sensors: Sensor[] }[]),
        [floorplan, sensors]
    );

    return (
        <div id="home">
            <Floorplan floorplan={floorplan} />

            {locations.map((location) => (
                <Tooltip key={location.name} location={location.name} sensors={location.sensors} />
            ))}
        </div>
    );
};
export default Home;
