import classNames from "classnames";
import {
    Dispatch,
    HTMLAttributes,
    PropsWithChildren,
    ReactNode,
    SetStateAction,
    useCallback,
    useState,
} from "react";
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

    return (
        <div {...props} className={classNames(className, styles.drawer)}>
            {filters.map((filter) => (
                <Drawer
                    key={filter.id}
                    id={filter.id}
                    open={filter.id === openDrawer}
                    allClosed={openDrawer === undefined}
                    onDrawerClick={setOpenDrawer}
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

    onDrawerClick: Dispatch<SetStateAction<string | undefined>>;
}>;

const Drawer = ({ id, open, allClosed, children, onDrawerClick }: DrawerProps) => {
    const toggleDrawer = useCallback(
        () =>
            onDrawerClick((current) => {
                if (current === id) {
                    return undefined;
                }

                return id;
            }),
        [id, onDrawerClick],
    );

    return (
        <div className={styles.filter}>
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
