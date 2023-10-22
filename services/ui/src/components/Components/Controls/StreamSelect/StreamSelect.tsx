import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import _ from "underscore";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import styles from "./StreamSelect.module.scss";

type StreamSelectProps = {
    streams: string[];
    stream: string | undefined;
} & AdditionalStateControlsProps;

type Option = {
    label: string;
    value: string;
};

const StreamSelect = ({ streams, stream, disabled, onChange }: StreamSelectProps) => {
    const [currentValue, setCurrentValue] = useState<Option>();

    const onValueChange = useCallback(
        (newValue: SingleValue<Option>) => {
            if (newValue && newValue.value !== stream) {
                const message = { stream: newValue.value };
                onChange(message);
            }
        },
        [onChange, stream],
    );

    const options: Option[] = useMemo(
        () =>
            _(streams)
                .sortBy((stream) => stream)
                .map((stream) => ({
                    label: stream,
                    value: stream,
                })),
        [streams],
    );

    useEffect(
        () => setCurrentValue(options.find((option) => option.value === stream)),
        [options, stream],
    );

    return (
        <div title="Select the stream for this device to play">
            <Select
                isDisabled={disabled}
                isSearchable
                options={options}
                onChange={onValueChange}
                value={currentValue}
                classNames={{
                    container: () => styles.container,
                    control: () => styles.control,
                    input: () => styles.input,
                    singleValue: () => styles.value,
                    menu: () => styles.menu,
                    option: (state) =>
                        classNames(styles.option, { [styles.focus]: state.isFocused }),
                    noOptionsMessage: () => styles.option,
                }}
            />
        </div>
    );
};
export default StreamSelect;
