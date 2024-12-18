import { useTranslation } from "react-i18next";
import Icon from "../Icon";

const Loader = () => {
    const { t } = useTranslation();

    return (
        <div role="alert" className="self-center" aria-label={t("common.loading")}>
            <Icon icon="loading" />
        </div>
    );
};
export default Loader;
