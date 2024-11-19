import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import LoginButton from "./LoginButton";
import LoginProtocol from "./LoginProtocol";

describe("LoginButton", () => {
    test("renders", () => {
        render(<LoginButton protocol={LoginProtocol.Google} />);

        const form = screen.getByRole("form");
        expect(form).toBeInTheDocument();
        expect(form).toHaveAttribute("method", "get");
        expect(form).toHaveAttribute("action", "/api/auth/google");

        const input = screen.getByDisplayValue("http://localhost:3000/");
        expect(input).toBeInTheDocument();
        expect(input).toBeInstanceOf(HTMLInputElement);

        const button = within(form).getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("Login with Google");
    });
});
