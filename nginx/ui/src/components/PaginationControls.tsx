import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";

interface PaginationControlsProps {
  page: number;
  setPage: (page: number) => void;
  lastPage?: number;
}

const PaginationControls = ({
  page,
  setPage,
  lastPage = page
}: PaginationControlsProps) => {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);

    if (!isNaN(value) && value <= lastPage + 1) {
      setPage(value - 1);
    }
  };

  return (
    <div className="pagination-controls">
      <PaginationButton
        page={0}
        title="First Page"
        icon={faAngleDoubleLeft}
        setPage={setPage}
        disabled={page === 0}
      />
      <PaginationButton
        page={page - 1}
        title="Previous Page"
        icon={faAngleLeft}
        setPage={setPage}
        disabled={page === 0}
      />

      <input
        type="number"
        value={page + 1}
        onChange={onInputChange}
        min={1}
        max={lastPage + 1}
      />

      <PaginationButton
        page={page + 1}
        title="Next Page"
        icon={faAngleRight}
        setPage={setPage}
        disabled={page > lastPage - 1}
      />
      <PaginationButton
        page={lastPage}
        title="Last Page"
        icon={faAngleDoubleRight}
        setPage={setPage}
        disabled={lastPage === page}
      />
    </div>
  );
};
export default PaginationControls;

interface PaginationButtonProps {
  page: number;
  icon: IconProp;
  title: string;
  setPage: (page: number) => void;
  disabled?: boolean;
}

const PaginationButton = ({
  page,
  icon,
  title,
  setPage,
  disabled = false
}: PaginationButtonProps) => {
  return (
    <button title={title} disabled={disabled} onClick={() => setPage(page)}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};
