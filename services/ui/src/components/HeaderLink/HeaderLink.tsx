import { NavLink, NavLinkRenderProps } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import { classNames } from "../../util";
import { buttonStyles } from "../Button";
import Icon, { IconType } from "../Icon";

type HeaderLinkProps = {
    route: Route;

    icon: IconType;

    text: string;
};

const headerLinkClasses = classNames(
    "h-full flex flex-row justify-center items-center gap-1 grow text-2xl",
    buttonStyles(),
);

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
    return classNames(headerLinkClasses, buttonStyles(isActive));
}
