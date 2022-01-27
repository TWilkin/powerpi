import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

interface MenuProps {
    items: MenuItemProps[];
    visible?: boolean;
}

const Menu = ({ items, visible = true }: MenuProps) => {
    if (visible) {
        return (
            <nav className="menu">
                {items.map((item) => (
                    <MenuItem key={item.path} {...item} />
                ))}
            </nav>
        );
    }

    return <></>;
};
export default Menu;

interface MenuItemProps {
    path: string;
    name: string;
    icon?: IconProp;
    visible?: boolean;
}

const MenuItem = ({ path, name, icon, visible = true }: MenuItemProps) => {
    const location = useLocation();

    if (visible) {
        return (
            <NavLink
                exact
                to={path}
                className={classNames("menu-item", { active: location.pathname.startsWith(path) })}
                title={name}
            >
                {icon && (
                    <>
                        <FontAwesomeIcon icon={icon} />{" "}
                    </>
                )}
                <span className="text">{name}</span>
            </NavLink>
        );
    }

    return <></>;
};
