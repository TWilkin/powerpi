import { faFilterCircleXmark, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { MouseEvent, PropsWithChildren, useState } from "react";
import Button from "../Button";
import styles from "./Filter.module.scss";

type FilterProps = PropsWithChildren<{
    onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
}>;

const Filter = ({ onClear, children }: FilterProps) => {
    const [showFilter, setShowFilter] = useState<boolean | undefined>(undefined);

    return (
        <div
            className={classnames(
                styles.filter,
                { [styles["slide-in"]]: showFilter },
                { [styles["slide-out"]]: showFilter === false }
            )}
        >
            <button
                className={styles.button}
                title="Click to show filters for this page"
                onClick={() => setShowFilter(!showFilter)}
            >
                <FontAwesomeIcon icon={faSliders} />
            </button>

            <div>
                {children}

                {onClear && <Button text="Clear" icon={faFilterCircleXmark} onClick={onClear} />}
            </div>
        </div>
    );
};
export default Filter;
