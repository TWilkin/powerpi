import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, { useState } from "react";

interface FilterProps {
    children: JSX.Element | JSX.Element[];
}

const Filter = ({ children }: FilterProps) => {
    const [showFilter, setShowFilter] = useState<boolean | undefined>(undefined);

    return (
        <div
            className={classnames(
                "filter",
                { "slide-in": showFilter },
                { "slide-out": showFilter === false }
            )}
        >
            <button className="filter-button" onClick={() => setShowFilter(!showFilter)}>
                <FontAwesomeIcon icon={faFilter} />
            </button>
            {children}
        </div>
    );
};
export default Filter;
