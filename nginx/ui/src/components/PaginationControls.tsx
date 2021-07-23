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
  hasNext?: boolean;
}

const PaginationControls = ({
  page,
  setPage,
  lastPage = page,
  hasNext = true
}: PaginationControlsProps) => {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);

    if (!isNaN(value)) {
      setPage(value - 1);
    }
  };

  return (
    <div>
      <PaginationButton
        page={0}
        icon={faAngleDoubleLeft}
        setPage={setPage}
        disabled={page === 0}
      />
      <PaginationButton
        page={page - 1}
        icon={faAngleLeft}
        setPage={setPage}
        disabled={page === 0}
      />

      <input type="number" value={page + 1} onChange={onInputChange} />

      <PaginationButton
        page={page + 1}
        icon={faAngleRight}
        setPage={setPage}
        disabled={!hasNext}
      />
      <PaginationButton
        page={lastPage}
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
  setPage: (page: number) => void;
  disabled?: boolean;
}

const PaginationButton = ({
  page,
  icon,
  setPage,
  disabled = false
}: PaginationButtonProps) => {
  return (
    <button disabled={disabled} onClick={() => setPage(page)}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};
