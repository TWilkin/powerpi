import styles from "./Menu.module.scss";
import MenuItem, { MenuItemProps } from "./MenuItem";

interface MenuProps {
    items: MenuItemProps[];
    visible?: boolean;
}

const Menu = ({ items, visible = true }: MenuProps) => {
    if (visible) {
        return (
            <nav className={styles.menu}>
                {items.map((item) => (
                    <MenuItem key={item.path} {...item} />
                ))}
            </nav>
        );
    }

    return <></>;
};
export default Menu;
