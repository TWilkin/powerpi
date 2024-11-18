import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import UserSettingsContextProvider from "./UserSettingsContextProvider";
import useUserSettings from "./useUserSettings";

const mocks = vi.hoisted(() => ({
    changeLanguage: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: {
            changeLanguage: mocks.changeLanguage,
        },
    }),
}));

describe("useUserSettings", () => {
    beforeEach(() => vi.resetAllMocks());

    test("initialises", () => {
        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current.settings).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
    });

    test("set language", () => {
        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current.settings).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.settings?.language).toBeUndefined();

        act(() => result.current.dispatch!({ type: "Language", language: "en-GB" }));

        expect(result.current.settings?.language).toBe("en-GB");

        expect(mocks.changeLanguage).toHaveBeenCalledTimes(1);
        expect(mocks.changeLanguage).toHaveBeenCalledWith("en-GB");
    });

    test("set unit", () => {
        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current.settings).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.settings?.units).toStrictEqual({});

        act(() => result.current.dispatch!({ type: "Unit", unitType: "temperature", unit: "K" }));

        expect(result.current.settings?.units).toStrictEqual({
            temperature: "K",
        });

        act(() => result.current.dispatch!({ type: "Unit", unitType: "gas", unit: "kWh" }));

        expect(result.current.settings?.units).toStrictEqual({
            temperature: "K",
            gas: "kWh",
        });
    });
});
