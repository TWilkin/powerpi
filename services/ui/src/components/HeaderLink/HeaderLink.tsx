import classNames from "classnames";
import { NavLink } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import { buttonStyles } from "../Button";
import Icon, { IconType } from "../Icon";

type HeaderLinkProps = {
    route: Route;

    icon: IconType;

    text: string;

    /** Whether to always show as a small link. */
    small?: boolean;
};

const headerLinkClasses = classNames(
    "relative h-full flex flex-row justify-center items-center gap-sm grow text-2xl",
    buttonStyles("default"),
    // when the link is the current route
    "aria-current-page:bg-sky-200 aria-current-page:dark:bg-purple-950",
);

/** Component for one of the main header navigation links. */
const HeaderLink = ({ route, icon, text, small = false }: HeaderLinkProps) => (
    <div className={classNames("h-20", { grow: !small })}>
        <NavLink to={RouteBuilder.build(route)} className={headerLinkClasses} aria-label={text}>
            <Icon icon={icon} className="text-3xl md:text-2xl" />

            {!small && <span className="hidden md:block">{text}</span>}
        </NavLink>
    </div>
);
export default HeaderLink;
