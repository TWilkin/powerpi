import { faFilterCircleXmark, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { MouseEvent, PropsWithChildren, useCallback, useRef, useState } from "react";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import Button from "../Button";
import styles from "./Filter.module.scss";

type FilterProps = PropsWithChildren<{
    onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}>;

const Filter = ({ onClear, className, children }: FilterProps) => {
    const filterRef = useRef<HTMLDivElement>(null);

    const [showFilter, setShowFilter] = useState<boolean | undefined>(undefined);

    const closeFilter = useCallback(
        () => setShowFilter((current) => (current !== undefined ? false : undefined)),
        []
    );

    useOnClickOutside(filterRef, closeFilter);

    return (
        <div
            className={classnames(
                styles.filter,
                { [styles["slide-in"]]: showFilter },
                { [styles["slide-out"]]: showFilter === false },
                className
            )}
            ref={filterRef}
        >
            <button
                className={styles.button}
                title="Click to show filters for this page"
                onClick={() => setShowFilter(!showFilter)}
            >
                <FontAwesomeIcon icon={faSliders} />
            </button>

            <div className={styles.content}>
                {children}

                {onClear && <Button text="Clear" icon={faFilterCircleXmark} onClick={onClear} />}
            </div>
        </div>
    );
};
export default Filter;
