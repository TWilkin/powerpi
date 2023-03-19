import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageFilterType } from "../MessageTypeFilter";

type HistoryLinkProps = {
    [key in MessageFilterType]?: string;
};

const HistoryLink = ({ type = "", entity = "", action = "" }: HistoryLinkProps) => {
    const target = useMemo(() => {
        const queryParams = [
            ["action", action],
            ["entity", entity],
            ["type", type],
        ];

        const search = new URLSearchParams(queryParams).toString();

        return { pathname: "/history", search };
    }, [action, entity, type]);

    return (
        <Link to={target} title="Show history for this device">
            <FontAwesomeIcon icon={faHistory} />
        </Link>
    );
};
export default HistoryLink;
