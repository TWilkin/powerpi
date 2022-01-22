import { PowerPiApi, Sensor } from "@powerpi/api";
import React, { useMemo } from "react";
import { useGetFloorplan } from "../../hooks/floorplan";
import useGetSensors from "../../hooks/sensors";
import Floorplan from "./Floorplan";
import Tooltip from "./Tooltip";

interface HomeProps {
    api: PowerPiApi;
}

const Home = ({ api }: HomeProps) => {
    const { floorplan } = useGetFloorplan(api);
    const { sensors } = useGetSensors(api);

    const locations = useMemo(
        () =>
            floorplan?.floors.reduce((locations, floor) => {
                locations.push(
                    ...floor.rooms.map((room) => ({
                        title: room.display_name ?? room.name,
                        location: room.name,
                        sensors: sensors?.filter((sensor) => sensor.location === room.name) ?? [],
                    }))
                );

                return locations;
            }, [] as { title: string; location: string; sensors: Sensor[] }[]),
        [floorplan, sensors]
    );

    return (
        <div id="home">
            {floorplan && <Floorplan floorplan={floorplan} />}

            {locations?.map((location) => (
                <Tooltip key={location.location} {...location} />
            ))}
        </div>
    );
};
export default Home;
