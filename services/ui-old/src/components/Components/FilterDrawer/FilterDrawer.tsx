import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import {
    HTMLAttributes,
    PropsWithChildren,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import { uniqueId } from "underscore";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import styles from "./FilterDrawer.module.scss";

type Filter = {
    id: string;
    icon: IconProp;
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
            {filters.map(({ id, icon, content }) => (
                <Drawer
                    key={id}
                    id={id}
                    icon={icon}
                    open={id === openDrawer}
                    allClosed={openDrawer === undefined}
                    onLabelClick={toggleDrawer}
                    onCloseClick={closeDrawer}
                >
                    {content}
                </Drawer>
            ))}
        </div>
    );
};
export default FilterDrawer;

type DrawerProps = PropsWithChildren<{
    id: string;

    icon: IconProp;

    open: boolean;

    allClosed: boolean;

    onLabelClick: (id: string) => void;

    onCloseClick: (id: string) => void;
}>;

const Drawer = ({
    id,
    icon,
    open,
    allClosed,
    children,
    onLabelClick,
    onCloseClick,
}: DrawerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const toggleDrawer = useCallback(() => onLabelClick(id), [id, onLabelClick]);

    const closeDrawer = useCallback(() => onCloseClick(id), [id, onCloseClick]);

    useOnClickOutside(ref, closeDrawer);

    const drawerId = useMemo(() => uniqueId(`drawer`), []);

    return (
        <div className={styles.filter} ref={ref}>
            <div
                id={drawerId}
                className={classNames(styles.content, {
                    [styles.open]: open,
                    [styles.closed]: !open,
                    [styles["all-closed"]]: allClosed,
                })}
                aria-label={`drawer-${id}`}
            >
                {children}
            </div>

            <button className={styles.label} onClick={toggleDrawer} aria-controls={drawerId}>
                <FontAwesomeIcon icon={icon} />
                {id}
            </button>
        </div>
    );
};
