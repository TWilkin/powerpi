import { ChangeEvent, useCallback, useMemo } from "react";
import useSetUserSettings from "../../../hooks/UserSettings/useSetUserSettings";
import UnitConverter, { UnitType } from "../../../services/UnitConverter";
import FilterGroup from "../FilterGroup";

type UnitOption = {
    type: UnitType;

    currentUnit: string | undefined;
};

const unitNames: Record<UnitType, string> = {
    gas: "Gas",
    power: "Power",
    temperature: "Temperature",
    volume: "Volume",
};

const UnitOption = ({ type, currentUnit }: UnitOption) => {
    const dispatch = useSetUserSettings();

    const options = useMemo(() => UnitConverter.getConverters(type), [type]);

    const onUnitChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;

            if (dispatch) {
                dispatch({ name: "UpdateUnit", type, unit: value });
            }
        },
        [dispatch, type],
    );

    return (
        <FilterGroup>
            {`${unitNames[type]}: `}
            <select onChange={onUnitChange}>
                {options.map(({ unit, name }) => (
                    <option key={unit} selected={currentUnit === unit} value={unit}>
                        {name} ({unit})
                    </option>
                ))}
            </select>
        </FilterGroup>
    );
};
export default UnitOption;
