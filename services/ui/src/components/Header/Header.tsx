import { useTranslation } from "react-i18next";
import Route from "../../routing/Route";
import useOptionalRoute from "../../routing/useOptionalRoute";
import HeaderLink from "../HeaderLink";
import Logo from "../Logo";
import HomeHeaderLink from "./HomeHeaderLink";

const Header = () => {
    const enabled = useOptionalRoute();

    const { t } = useTranslation();

    return (
        <header>
            <nav className="flex flex-row items-center border-b-2 border-border divide-x-2 divide-border">
                <Logo />

                {enabled?.home && <HomeHeaderLink />}

                <HeaderLink route={Route.Device} icon="device" text={t("navigation.devices")} />

                {enabled?.history && (
                    <HeaderLink
                        route={Route.History}
                        icon="history"
                        text={t("navigation.history")}
                    />
                )}

                <HeaderLink
                    route={Route.Settings}
                    icon="settings"
                    text={t("navigation.settings")}
                    small
                />
            </nav>
        </header>
    );
};
export default Header;
