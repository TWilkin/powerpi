import { renderHook } from "@testing-library/react";
import useUserSettings, { defaultSettings } from "./useUserSettings";

jest.spyOn(Storage.prototype, "getItem");

describe("useUserSettings", () => {
    test("nothing stored", () => {
        const { result } = renderHook(useUserSettings);

        expect(result.current).toBe(defaultSettings);
    });

    test("something stored", () => {
        const settings = {
            units: {
                gas: "kWh",
            },
        };

        Storage.prototype.getItem = () => JSON.stringify(settings);

        const { result } = renderHook(useUserSettings);

        expect(result.current).not.toBe(defaultSettings);
        expect(result.current.units["gas"]).toBe("kWh");
        expect(result.current.units["temperature"]).toBe("°C");
    });
});
