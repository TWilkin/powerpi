import { useTranslation } from "react-i18next";
import Route from "../../routing/Route";
import useOptionalRoute from "../../routing/useOptionalRoute";
import HeaderLink from "../HeaderLink";
import Logo from "../Logo";

const Header = () => {
    const enabled = useOptionalRoute();

    const { t } = useTranslation();

    return (
        <header>
            <nav className="flex flex-row items-center border-b-2 border-border divide-x-2 divide-border">
                <Logo />

                {enabled?.home && (
                    <HeaderLink route={Route.Home} icon="home" text={t("navigation.home")} />
                )}

                <HeaderLink route={Route.Device} icon="device" text={t("navigation.devices")} />

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
