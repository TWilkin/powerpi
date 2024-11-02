import LoginButton from "./LoginButton";
import LoginProtocol from "./LoginProtocol";

const LoginPage = () => (
    <div className="flex flex-col gap-1 items-center">
        <LoginButton protocol={LoginProtocol.Google} />
    </div>
);
export default LoginPage;
