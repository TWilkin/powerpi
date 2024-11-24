import LoginButton from "./LoginButton";
import LoginProtocol from "./LoginProtocol";

const LoginPage = () => (
    <div className="flex flex-col gap items-center">
        <LoginButton protocol={LoginProtocol.Google} />
    </div>
);
export default LoginPage;
