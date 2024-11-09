import { NavLink } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import { classNames } from "../../util";
import { buttonClasses } from "../Button";
import Icon, { IconType } from "../Icon";

type HeaderLinkProps = {
    route: Route;

    icon: IconType;

    text: string;
};

const headerLinkClasses = classNames(
    "h-full flex flex-row justify-center items-center gap-1 grow text-2xl",
    // when the link is the current route
    "aria-current-page:bg-sky-200 aria-current-page:dark:bg-purple-950",
    buttonClasses,
);

const HeaderLink = ({ route, icon, text }: HeaderLinkProps) => (
    <div className="h-20 grow">
        <NavLink to={RouteBuilder.build(route)} className={headerLinkClasses} aria-label={text}>
            <Icon icon={icon} />

            <span className="hidden md:block">{text}</span>
        </NavLink>
    </div>
);
export default HeaderLink;
