import Route from "../../routing/Route";
import { IconType } from "../Icon";

export type CommonHeaderLinkProps = {
    route: Route | string;

    icon?: IconType;

    text: string;
};
