import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoginPage from "./LoginPage";

describe("LoginPage", () =>
    test("renders", () => {
        render(<LoginPage />);

        expect(screen.getByRole("button", { name: "Login with Google" })).toBeInTheDocument();
    }));
