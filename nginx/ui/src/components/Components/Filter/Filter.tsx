import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { useState } from "react";
import styles from "./Filter.module.scss";

interface FilterProps {
    children: JSX.Element | JSX.Element[];
}

const Filter = ({ children }: FilterProps) => {
    const [showFilter, setShowFilter] = useState<boolean | undefined>(undefined);

    return (
        <div
            className={classnames(
                styles.filter,
                { [styles["slide-in"]]: showFilter },
                { [styles["slide-out"]]: showFilter === false }
            )}
        >
            <button className={styles.button} onClick={() => setShowFilter(!showFilter)}>
                <FontAwesomeIcon icon={faFilter} />
            </button>
            {children}
        </div>
    );
};
export default Filter;
