import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { faMusic, faRadio } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { OptionProps, components } from "react-select";
import { StreamOptionType } from "./types";

const StreamOption = ({ label, children, ...props }: OptionProps<StreamOptionType>) => {
    const icon = useMemo(() => getStreamIcon(label), [label]);

    return (
        <components.Option label={label} {...props}>
            <FontAwesomeIcon icon={icon} /> {children}
        </components.Option>
    );
};
export default StreamOption;

function getStreamIcon(stream: string) {
    const lower = stream.toLocaleLowerCase();

    if (lower.includes("radio")) {
        return faRadio;
    }

    if (lower.includes("spotify")) {
        return faSpotify;
    }

    return faMusic;
}
