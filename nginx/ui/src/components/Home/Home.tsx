import { PowerPiApi, Sensor } from "@powerpi/api";
import React, { useMemo } from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { useGetFloorplan } from "../../hooks/floorplan";
import useGetSensors from "../../hooks/sensors";
import Menu from "../Components/Menu";
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
                        floor: floor.name,
                        sensors: sensors?.filter((sensor) => sensor.location === room.name) ?? [],
                    }))
                );

                return locations;
            }, [] as { title: string; location: string; floor: string; sensors: Sensor[] }[]),
        [floorplan, sensors]
    );

    const defaultFloor = useMemo(() => {
        if ((floorplan?.floors?.length ?? 0) > 0) {
            return floorplan?.floors[0].name;
        }

        return undefined;
    }, [floorplan]);

    return (
        <div id="home">
            {floorplan && (
                <>
                    <Menu
                        items={floorplan.floors.map((floor) => ({
                            path: `/home/${floor.name}`,
                            name: floor.display_name ?? floor.name,
                        }))}
                        visible={floorplan.floors.length > 1}
                    />

                    <Switch>
                        {defaultFloor && (
                            <Redirect exact from="/home" to={`/home/${defaultFloor}`} />
                        )}

                        <Route
                            path="/home/:floor"
                            render={(props: RouteComponentProps<{ floor: string }>) => (
                                <>
                                    <Floorplan
                                        floorplan={floorplan}
                                        current={props.match.params.floor}
                                    />

                                    {locations?.map((location) => (
                                        <Tooltip
                                            key={`${location.floor}${location.location}`}
                                            {...location}
                                        />
                                    ))}
                                </>
                            )}
                        />
                    </Switch>
                </>
            )}
        </div>
    );
};
export default Home;
