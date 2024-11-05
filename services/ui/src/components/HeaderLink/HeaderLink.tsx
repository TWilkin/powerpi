import classNames from "classnames";
import { NavLink, NavLinkRenderProps } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import Icon, { IconType } from "../Icon";

type HeaderLinkProps = {
    route: Route;

    icon: IconType;

    text: string;
};

const HeaderLink = ({ route, icon, text }: HeaderLinkProps) => (
    <div className="h-20 grow">
        <NavLink to={RouteBuilder.build(route)} className={classGenerator} aria-label={text}>
            <Icon icon={icon} />

            <span className="hidden md:block">{text}</span>
        </NavLink>
    </div>
);
export default HeaderLink;

function classGenerator({ isActive }: NavLinkRenderProps) {
    return classNames(
        "h-full flex flex-row justify-center items-center gap-1 grow text-2xl font-semibold p-2 text-black dark:text-white",
        {
            ["bg-sky-100 dark:bg-purple-900"]: !isActive,
            ["bg-sky-300 dark:bg-purple-950"]: isActive,
        },
    );
}
