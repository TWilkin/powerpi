import { faCog } from "@fortawesome/free-solid-svg-icons";
import { Floorplan as IFloorplan, Sensor } from "@powerpi/common-api";
import { useMemo } from "react";
import useGetSensors from "../../hooks/useGetSensors";
import FilterDrawer from "../Components/FilterDrawer";
import Loading from "../Components/Loading";
import Menu from "../Components/Menu";
import UnitSettings from "../Components/UnitSettings";
import Floorplan from "./Floorplan";
import Tooltip from "./Tooltip";

interface HomeProps {
    floorplan: IFloorplan | undefined;
}

const Home = ({ floorplan }: HomeProps) => {
    const { sensors } = useGetSensors();

    const locations = useMemo(
        () =>
            floorplan?.floors.reduce(
                (locations, floor) => {
                    locations.push(
                        ...floor.rooms.map((room) => ({
                            title: room.display_name ?? room.name,
                            location: room.name,
                            floor: floor.name,
                            sensors:
                                sensors?.filter(
                                    (sensor) => sensor.visible && sensor.location === room.name,
                                ) ?? [],
                        })),
                    );

                    return locations;
                },
                [] as { title: string; location: string; floor: string; sensors: Sensor[] }[],
            ),
        [floorplan, sensors],
    );

    return (
        <div>
            {locations?.map((location) => (
                <Tooltip key={`${location.floor}${location.location}`} {...location} />
            ))}

            <Loading loading={!floorplan}>
                <Menu
                    items={
                        floorplan?.floors.map((floor) => ({
                            path: `/home/${floor.name}`,
                            name: floor.display_name ?? floor.name,
                        })) ?? []
                    }
                    visible={(floorplan?.floors.length ?? 0) > 1}
                />

                {floorplan && <Floorplan floorplan={floorplan} />}
            </Loading>

            <FilterDrawer
                filters={[
                    {
                        id: "Settings",
                        icon: faCog,
                        content: <UnitSettings />,
                    },
                ]}
            />
        </div>
    );
};
export default Home;
