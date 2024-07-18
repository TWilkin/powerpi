import { renderHook } from "@testing-library/react";
import { UserSettingsContextProvider } from "./UserSettingsContext";
import { defaultSettings } from "./defaults";
import useUserSettings from "./useUserSettings";

jest.spyOn(Storage.prototype, "getItem");

describe("useUserSettings", () => {
    test("nothing stored", () => {
        Storage.prototype.getItem = () => null;

        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current).toBe(defaultSettings);
    });

    test("something stored", () => {
        const settings = {
            units: {
                gas: "kWh",
            },
        };

        Storage.prototype.getItem = () => JSON.stringify(settings);

        const { result } = renderHook(useUserSettings, { wrapper: UserSettingsContextProvider });

        expect(result.current).not.toBe(defaultSettings);
        expect(result.current.units["gas"]).toBe("kWh");
        expect(result.current.units["temperature"]).toBe("°C");
    });
});
