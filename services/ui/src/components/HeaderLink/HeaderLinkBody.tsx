import classNames from "classnames";
import { ComponentProps } from "react";
import { NavLink } from "react-router-dom";
import RouteBuilder from "../../routing/RouteBuilder";
import { buttonStyles } from "../Button";
import Icon from "../Icon";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";

const headerLinkBodyClasses = classNames(
    "relative h-full flex flex-row justify-center items-center gap-sm grow text-2xl",
    buttonStyles("default"),
    // when the link is the current route
    "aria-current-page:bg-bg-selected",
);

type HeaderLinkBodyProps = Omit<
    ComponentProps<typeof NavLink>,
    "to" | "aria-label" | "children" | "className"
> &
    Omit<CommonHeaderLinkProps, "text"> & {
        text?: CommonHeaderLinkProps["text"];
    };

const HeaderLinkBody = ({ route, icon, text, ...props }: HeaderLinkBodyProps) => (
    <NavLink
        {...props}
        to={RouteBuilder.build(route)}
        className={headerLinkBodyClasses}
        aria-label={text}
    >
        {icon && <Icon icon={icon} className="text-3xl md:text-2xl" />}

        {text && <span className="hidden md:block">{text}</span>}
    </NavLink>
);
export default HeaderLinkBody;
