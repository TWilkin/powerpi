import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import _ from "underscore";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import StreamOption from "./StreamOption";
import styles from "./StreamSelect.module.scss";
import { StreamOptionType } from "./types";

type StreamSelectProps = {
    streams: string[];
    stream: string | undefined;
} & AdditionalStateControlsProps;

const StreamSelect = ({ streams, stream, disabled, onChange }: StreamSelectProps) => {
    const [currentValue, setCurrentValue] = useState<StreamOptionType>();

    const onValueChange = useCallback(
        (newValue: SingleValue<StreamOptionType>) => {
            if (newValue && newValue.value !== stream) {
                const message = { stream: newValue.value };
                onChange(message);
            }
        },
        [onChange, stream],
    );

    const options: StreamOptionType[] = useMemo(
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
        <div className={styles.container} title="Select the stream for this device to play">
            <FontAwesomeIcon icon={faMusic} className={styles.icon} />

            <Select
                isDisabled={disabled}
                isSearchable
                isMulti={false}
                options={options}
                onChange={onValueChange}
                value={currentValue}
                components={{
                    Option: StreamOption,
                }}
                classNames={{
                    container: () => styles.select,
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
