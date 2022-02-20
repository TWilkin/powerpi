import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./MenuItem.module.scss";

export interface MenuItemProps {
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
                to={path}
                className={classNames(styles.item, {
                    [styles.active]: location.pathname.startsWith(path),
                })}
                title={name}
            >
                {icon && (
                    <>
                        <FontAwesomeIcon icon={icon} />{" "}
                    </>
                )}
                <span className={styles.text}>{name}</span>
            </NavLink>
        );
    }

    return <></>;
};
export default MenuItem;
