import { Device } from "@powerpi/common-api";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import { buttonStyles } from "../Button";
import Icon from "../Icon";

type HistoryLinkProps = {
    device: Device;
};

const HistoryLink = ({ device }: HistoryLinkProps) => {
    const { t } = useTranslation();

    return (
        <Link
            to={RouteBuilder.build(Route.Root, Route.History)}
            className={classNames(buttonStyles("icon"), "rounded border border-border")}
            aria-label={t("common.history link", { device: device.display_name })}
        >
            <Icon icon="history" />
        </Link>
    );
};
export default HistoryLink;
