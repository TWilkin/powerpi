import { act, renderHook } from "@testing-library/react";
import { UseTranslationResponse } from "react-i18next";
import { vi } from "vitest";
import { UserSettingsType } from "./UserSettingsContext";
import UserSettingsContextProvider from "./UserSettingsContextProvider";
import useUserSettings from "./useUserSettings";

vi.spyOn(Storage.prototype, "getItem");

const mocks = vi.hoisted(() => ({
    changeLanguage: vi.fn(),
}));

vi.mock("react-i18next", async () => {
    const i18next = await vi.importActual("react-i18next");
    const useTranslation = i18next.useTranslation as (
        ns: string,
    ) => UseTranslationResponse<"defaults", undefined>;

    return {
        useTranslation: () => {
            const { t } = useTranslation("defaults");
            return {
                t,
                i18n: {
                    changeLanguage: mocks.changeLanguage,
                },
            };
        },
    };
});

describe("useUserSettings", () => {
    beforeEach(() => {
        Storage.prototype.getItem = () => null;

        vi.resetAllMocks();
    });

    test("initialises from defaults", () => {
        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current.settings).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.settings).toStrictEqual({
            language: undefined,
            units: {
                temperature: "°C",
                gas: "m3",
            },
        });
    });

    test("initialises from storage", () => {
        const settings: UserSettingsType = {
            language: "en-US",
            units: {
                gas: "kWh",
            },
        };

        Storage.prototype.getItem = () => JSON.stringify(settings);

        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current.settings).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.settings).toStrictEqual({
            language: "en-US",
            units: {
                temperature: "°C",
                gas: "kWh",
            },
        });
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
        expect(result.current.settings?.units).toStrictEqual({
            temperature: "°C",
            gas: "m3",
        });

        act(() => result.current.dispatch!({ type: "Unit", unitType: "temperature", unit: "K" }));

        expect(result.current.settings?.units).toStrictEqual({
            temperature: "K",
            gas: "m3",
        });

        act(() => result.current.dispatch!({ type: "Unit", unitType: "gas", unit: "kWh" }));

        expect(result.current.settings?.units).toStrictEqual({
            temperature: "K",
            gas: "kWh",
        });
    });
});
