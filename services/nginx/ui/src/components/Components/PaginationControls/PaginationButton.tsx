import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    disabled = false,
}: PaginationButtonProps) => {
    return (
        <button title={title} disabled={disabled} onClick={() => setPage(page)}>
            <FontAwesomeIcon icon={icon} />
        </button>
    );
};
export default PaginationButton;
