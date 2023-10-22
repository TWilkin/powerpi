import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import _ from "underscore";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";

type StreamSelectProps = {
    streams: string[];
    stream: string | undefined;
} & AdditionalStateControlsProps;

const StreamSelect = ({ streams, stream, disabled, onChange }: StreamSelectProps) => {
    const [currentValue, setCurrentValue] = useState(stream);

    const onValueChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            event.preventDefault();

            const newValue = event.target.value;
            if (newValue !== stream) {
                const message = { stream: newValue };
                onChange(message);
            }
        },
        [onChange, stream],
    );

    useEffect(() => setCurrentValue(stream), [stream]);

    const sortedStreams = useMemo(() => _(streams).sortBy((stream) => stream), [streams]);

    return (
        <div title="Select the stream for this device to play">
            <select disabled={disabled} onChange={onValueChange}>
                {sortedStreams.map((stream) => (
                    <option key={stream} selected={currentValue === stream}>
                        {stream}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default StreamSelect;
