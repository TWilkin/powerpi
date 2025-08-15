import Route from "../../routing/Route";
import { IconType } from "../Icon";

export type CommonHeaderLinkProps = {
    route: Route;

    icon?: IconType;

    text: string;
};
