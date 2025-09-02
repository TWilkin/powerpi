import { useTranslation } from "react-i18next";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import HeaderLink from "../HeaderLink";

const HomeHeaderLink = () => {
    const { t } = useTranslation();

    const { data: floorplan } = useQueryFloorplan();

    return (
        <HeaderLink route={Route.Home} icon="home" text={t("navigation.home")}>
            {floorplan.floors.length > 1 &&
                floorplan.floors.map((floor) => (
                    <HeaderLink.SubLink
                        key={floor.name}
                        route={RouteBuilder.build(Route.Root, Route.Home, floor.name)}
                        text={floor.display_name ?? floor.name}
                    />
                ))}
        </HeaderLink>
    );
};
export default HomeHeaderLink;
