import { useMemo } from "react";
import { Button } from "../../components/Button";
import LoginProtocol from "./LoginProtocol";

type LoginButtonProps = {
    protocol: LoginProtocol;
};

const LoginButton = ({ protocol }: LoginButtonProps) => {
    const { protocolName, url } = useMemo(
        () => ({
            protocolName:
                Object.keys(LoginProtocol)[Object.values(LoginProtocol).indexOf(protocol)],
            url: `/api/auth/${protocol}`,
        }),
        [protocol],
    );

    return (
        <form method="get" action={url}>
            <input type="hidden" name="redirect_uri" value={`${window.location.origin}/`} />
            <Button type="submit">Login with {protocolName}</Button>
        </form>
    );
};
export default LoginButton;
