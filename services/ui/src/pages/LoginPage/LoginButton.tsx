import { FormHTMLAttributes, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import LoginProtocol from "./LoginProtocol";

type LoginButtonProps = {
    protocol: LoginProtocol;
} & FormHTMLAttributes<HTMLFormElement>;

const LoginButton = ({ protocol, ...props }: LoginButtonProps) => {
    const { t } = useTranslation();

    const { protocolName, url } = useMemo(
        () => ({
            protocolName:
                Object.keys(LoginProtocol)[Object.values(LoginProtocol).indexOf(protocol)],
            url: `/api/auth/${protocol}`,
        }),
        [protocol],
    );

    return (
        <form {...props} method="get" action={url} name={`${protocol}-login`}>
            <input type="hidden" name="redirect_uri" value={`${window.location.origin}/`} />

            <Button type="submit" icon={protocol}>
                {t("pages.login.login with")} {protocolName}
            </Button>
        </form>
    );
};
export default LoginButton;
