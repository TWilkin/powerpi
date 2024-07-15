import { ChangeEvent, useCallback, useMemo } from "react";
import { chain as _ } from "underscore";
import useSetUserSettings from "../../../hooks/UserSettings/useSetUserSettings";
import UnitConverter, { UnitType } from "../../../services/UnitConverter";
import FilterGroup from "../FilterGroup";

type UnitOption = {
    type: UnitType;

    currentUnit: string | undefined;
};

const UnitOption = ({ type, currentUnit }: UnitOption) => {
    const dispatch = useSetUserSettings();

    const options = useMemo(
        () =>
            _(UnitConverter.getConverters(type))
                .map((unit) => unit.unit)
                .unique()
                .sortBy((unit) => unit.toLocaleLowerCase())
                .value(),
        [type],
    );

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
            {type}:
            <select onChange={onUnitChange}>
                {options.map((option) => (
                    <option key={option} selected={currentUnit === option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </FilterGroup>
    );
};
export default UnitOption;
