import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
import RouteBuilder from "../../routing/RouteBuilder";
import Floorplan from "./Floorplan";
import useFloor from "./useFloor";

const HomePage = () => {
    const { t } = useTranslation();

    const currentFloor = useFloor();

    const { data: floorplan } = useQueryFloorplan();

    if (floorplan.floors.length === 0) {
        return <>{t("pages.home.empty")}</>;
    }

    if (floorplan.floors.findIndex((floor) => floor.name === currentFloor) === -1) {
        return <>{t("pages.home.unknown floor", { floor: currentFloor })}</>;
    }

    return (
        <div className="flex flex-col gap-2 flex-1">
            {floorplan.floors.length > 1 && (
                <div className="flex flex-row gap-2">
                    {floorplan.floors.map((floor) => (
                        <NavLink key={floor.name} to={RouteBuilder.build(floor.name)}>
                            {floor.display_name ?? floor.name}
                        </NavLink>
                    ))}
                </div>
            )}

            <Floorplan floorplan={floorplan} />
        </div>
    );
};
export default HomePage;
