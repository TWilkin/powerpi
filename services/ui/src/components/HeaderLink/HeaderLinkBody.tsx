import { NavLink } from "react-router-dom";
import RouteBuilder from "../../routing/RouteBuilder";
import Icon from "../Icon";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";

type HeaderLinkBodyProps = Omit<CommonHeaderLinkProps, "text"> & {
    text?: CommonHeaderLinkProps["text"];

    className?: HTMLDivElement["className"];
};

const HeaderLinkBody = ({ route, icon, text, className }: HeaderLinkBodyProps) => (
    <NavLink to={RouteBuilder.build(route)} aria-label={text} className={className}>
        {icon && <Icon icon={icon} className="text-3xl md:text-2xl" />}

        {text && <span className="hidden md:block">{text}</span>}
    </NavLink>
);
export default HeaderLinkBody;
