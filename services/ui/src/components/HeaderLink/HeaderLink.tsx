import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { PropsWithChildren } from "react";
import { NavLink, NavLinkRenderProps } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";

type HeaderLinkProps = PropsWithChildren<{
    route: Route;

    icon: IconProp;
}>;

const HeaderLink = ({ route, icon, children }: HeaderLinkProps) => (
    <NavLink to={RouteBuilder.build(route)} className={classGenerator}>
        <FontAwesomeIcon icon={icon} />

        {children}
    </NavLink>
);
export default HeaderLink;

function classGenerator({ isActive }: NavLinkRenderProps) {
    return classNames(
        "leading-header flex flex-row justify-center items-center gap-1 grow text-2xl font-semibold p-2 text-black dark:text-white",
        {
            ["bg-sky-100 dark:bg-purple-900"]: !isActive,
            ["bg-sky-300 dark:bg-purple-950"]: isActive,
        },
    );
}
