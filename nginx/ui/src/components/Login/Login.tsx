import { useCallback } from "react";
import styles from "./Login.module.scss";

interface LoginButtonProps {
    protocol: string;
}

const LoginButton = ({ protocol }: LoginButtonProps) => {
    const onLoginClick = useLogin(protocol);

    return <button onClick={onLoginClick}>{`Login with ${protocol}`}</button>;
};

const Login = () => {
    return (
        <div className={styles.login}>
            <LoginButton protocol="Google" />
        </div>
    );
};
export default Login;

function useLogin(protocol: string) {
    // TODO get the last location again somehow
    return useCallback(() => {
        const path = `/api/auth/${protocol.toLowerCase()}?redirect_uri=${window.location.origin}/`;

        window.location.href = path;
    }, [protocol]);
}
