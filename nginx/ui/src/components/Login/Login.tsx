import { useCallback } from "react";
import { useLastLocation } from "react-router-last-location";

interface LoginButtonProps {
    protocol: string;
}

const LoginButton = ({ protocol }: LoginButtonProps) => {
    const onLoginClick = useLogin(protocol);

    return <button onClick={onLoginClick}>{`Login with ${protocol}`}</button>;
};

const Login = () => {
    return (
        <div id="login">
            <LoginButton protocol="Google" />
        </div>
    );
};
export default Login;

function useLogin(protocol: string) {
    const lastLocation = useLastLocation();

    return useCallback(() => {
        const redirectUri = lastLocation ? lastLocation.pathname : "";
        const path = `/api/auth/${protocol.toLowerCase()}?redirect_uri=${
            window.location.origin
        }/${redirectUri}`;

        window.location.href = path;
    }, [lastLocation, protocol]);
}
