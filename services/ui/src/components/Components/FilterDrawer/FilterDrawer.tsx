import classNames from "classnames";
import { HTMLAttributes, PropsWithChildren, ReactNode, useCallback, useRef, useState } from "react";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import styles from "./FilterDrawer.module.scss";

type Filter = {
    id: string;
    content: ReactNode;
};

type FilterDrawerProps = {
    filters: Filter[];
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

const FilterDrawer = ({ className, filters, ...props }: FilterDrawerProps) => {
    const [openDrawer, setOpenDrawer] = useState<string | undefined>(undefined);

    const toggleDrawer = useCallback(
        (id: string) =>
            setOpenDrawer((current) => {
                if (current === id) {
                    return undefined;
                }

                return id;
            }),
        [],
    );

    const closeDrawer = useCallback(
        (id: string) =>
            setOpenDrawer((current) => {
                if (current === id) {
                    return undefined;
                }

                return current;
            }),
        [],
    );

    return (
        <div {...props} className={classNames(className, styles.drawer)}>
            {filters.map((filter) => (
                <Drawer
                    key={filter.id}
                    id={filter.id}
                    open={filter.id === openDrawer}
                    allClosed={openDrawer === undefined}
                    onLabelClick={toggleDrawer}
                    onCloseClick={closeDrawer}
                >
                    {filter.content}
                </Drawer>
            ))}
        </div>
    );
};
export default FilterDrawer;

type DrawerProps = PropsWithChildren<{
    id: string;

    open: boolean;

    allClosed: boolean;

    onLabelClick: (id: string) => void;

    onCloseClick: (id: string) => void;
}>;

const Drawer = ({ id, open, allClosed, children, onLabelClick, onCloseClick }: DrawerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const toggleDrawer = useCallback(() => onLabelClick(id), [id, onLabelClick]);

    const closeDrawer = useCallback(() => onCloseClick(id), [id, onCloseClick]);

    useOnClickOutside(ref, closeDrawer);

    return (
        <div className={styles.filter} ref={ref}>
            <div
                className={classNames(styles.content, {
                    [styles.open]: open,
                    [styles.closed]: !open,
                    [styles["all-closed"]]: allClosed,
                })}
            >
                {children}
            </div>

            <button className={styles.label} onClick={toggleDrawer}>
                {id}
            </button>
        </div>
    );
};
