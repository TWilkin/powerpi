import { Device } from "@powerpi/common-api";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import Icon from "../Icon";

type HistoryLinkProps = {
    device: Device;
};

const HistoryLink = ({ device }: HistoryLinkProps) => {
    const { t } = useTranslation();

    return (
        <NavLink
            to={RouteBuilder.build(Route.History)}
            aria-label={t("common.history link", { device: device.display_name })}
        >
            <Icon icon="history" />
        </NavLink>
    );
};
export default HistoryLink;
