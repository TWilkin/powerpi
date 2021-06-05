import React from "react";

interface LoginButtonProps {
  protocol: string;
}

const LoginButton = ({ protocol }: LoginButtonProps) => {
  return (
    <button onClick={() => onLoginClick(protocol)}>
      {`Login with ${protocol}`}
    </button>
  );
};

const Login = () => {
  return (
    <div id="login">
      <LoginButton protocol="Google" />
    </div>
  );
};
export default Login;

function onLoginClick(protocol: string) {
  window.location.pathname = `/api/auth/${protocol.toLowerCase()}`;
}
