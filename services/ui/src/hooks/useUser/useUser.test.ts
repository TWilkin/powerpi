import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useUser from "./useUser";

const mocks = vi.hoisted(() => ({
    useCookies: vi.fn(),
}));

vi.mock("react-cookie", async () => ({
    useCookies: mocks.useCookies,
}));

describe("useUser", () => {
    test("not logged in", () => {
        mocks.useCookies.mockImplementation(() => [{}]);

        const { result } = renderHook(useUser);

        expect(result.current).toBeUndefined();
    });

    test("logged in", () => {
        const jwt =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.9zi_iWk9FB_tscCPypRaHt58xyjxdm8D1ec4sIWjfRs";
        mocks.useCookies.mockImplementation(() => [{ jwt }]);

        const { result } = renderHook(useUser);

        expect(result.current).toBe("jdoe@example.com");
    });

    test("malformed", () => {
        const jwt = "malformed";
        mocks.useCookies.mockImplementation(() => [{ jwt }]);

        const { result } = renderHook(useUser);

        expect(result.current).toBeUndefined();
    });
});
