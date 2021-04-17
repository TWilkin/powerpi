import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface FilterProps {
  children: JSX.Element | JSX.Element[];
}

const Filter = ({ children }: FilterProps) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <>
      <FilterButton onClick={() => setShowFilter(true)} />

      {showFilter && (
        <div className="filter">
          <FilterButton onClick={() => setShowFilter(false)} />
          {children}
        </div>
      )}
    </>
  );
};

interface FilterButtonProps {
  onClick: () => void;
}

const FilterButton = ({ onClick }: FilterButtonProps) => {
  return (
    <button className="filter-button" onClick={onClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>
  );
};

export default Filter;
