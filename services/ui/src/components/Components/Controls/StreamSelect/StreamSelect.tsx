import { ChangeEvent, useCallback, useEffect, useState } from "react";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";

type StreamSelectProps = {
    streams: string[];
    selected: string | undefined;
} & AdditionalStateControlsProps;

const StreamSelect = ({ streams, selected, disabled, onChange }: StreamSelectProps) => {
    const [currentValue, setCurrentValue] = useState(selected);

    const onValueChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            event.preventDefault();

            const newValue = event.target.value;
            if (newValue !== selected) {
                const message = { stream: newValue };
                onChange(message);
            }
        },
        [onChange, selected],
    );

    useEffect(() => setCurrentValue(selected), [selected]);

    return (
        <div title="Select the stream for this device to play">
            <select disabled={disabled} onChange={onValueChange}>
                {streams.map((stream) => (
                    <option key={stream} selected={currentValue === stream}>
                        {stream}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default StreamSelect;
