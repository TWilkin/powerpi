import { act, renderHook } from "@testing-library/react";
import { UserSettingsContextProvider } from "./UserSettingsContext";
import { defaultSettings } from "./defaults";
import useSetUserSettings from "./useSetUserSettings";

jest.spyOn(Storage.prototype, "getItem");
jest.spyOn(Storage.prototype, "setItem");
jest.spyOn(Storage.prototype, "removeItem");

describe("useSetUserSettings", () => {
    const setItem = jest.fn();
    const removeItem = jest.fn();

    beforeEach(() => {
        Storage.prototype.setItem = setItem;
        Storage.prototype.removeItem = removeItem;

        jest.resetAllMocks();
    });

    test("update unit", () => {
        Storage.prototype.getItem = () => "";

        const setItem = jest.fn();
        Storage.prototype.setItem = setItem;

        const { result } = renderHook(useSetUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current).toBeDefined();
        act(() => result.current!({ name: "UpdateUnit", type: "gas", unit: "m3" }));

        expect(setItem).toHaveBeenCalledWith(
            "userSettings",
            JSON.stringify({
                ...defaultSettings,
                units: {
                    ...defaultSettings.units,
                    gas: "m3",
                },
            }),
        );

        expect(removeItem).not.toHaveBeenCalled();
    });

    test("reset to defaults", () => {
        Storage.prototype.getItem = () =>
            JSON.stringify({
                units: {
                    gas: "kWh",
                },
            });

        const { result } = renderHook(useSetUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current).toBeDefined();
        act(() => result.current!({ name: "UpdateUnit", type: "gas", unit: "m3" }));

        expect(removeItem).toHaveBeenCalledWith("userSettings");
    });
});
