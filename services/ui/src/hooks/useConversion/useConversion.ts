import { useCallback } from "react";
import UnitConverter, { UnitType, UnitValue } from "../../services/UnitConverter";
import useUserSettings from "../useUserSettings";

/** Hook returning a callback to perform the conversion from one unit to another. */
export default function useConversion() {
    const { settings } = useUserSettings();

    return useCallback(
        (type: UnitType, value: UnitValue) => {
            const userSelectedUnit = settings?.units[type];

            if (userSelectedUnit && userSelectedUnit !== value.unit) {
                return UnitConverter.convert(type, value, userSelectedUnit);
            }

            return value;
        },
        [settings?.units],
    );
}
