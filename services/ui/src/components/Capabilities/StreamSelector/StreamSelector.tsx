import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import Icon, { IconType } from "../../Icon";
import Select from "../../Select";
import CapabilityControlProps from "../CapabilityControlProps";
import getDeviceCapabilities from "../getDeviceCapabilities";

type StreamSelectorProps = {
    streams: ReturnType<typeof getDeviceCapabilities>["streams"];
} & CapabilityControlProps;

/** A select drop-down for selecting the stream to play on a device. */
const StreamSelector = ({ device, streams, disabled, mutateAsync }: StreamSelectorProps) => {
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            _(streams)
                .sortBy((stream) => stream.toLocaleLowerCase())
                .map((stream) => ({
                    label: stream,
                    icon: getStreamIcon(stream),
                    value: stream,
                })),
        [streams],
    );

    const handleChange = useCallback(
        (stream: string) => mutateAsync({ newAdditionalState: { stream } }),
        [mutateAsync],
    );

    return (
        <>
            <Icon icon="stream" className="self-center" />

            <Select
                value={device.additionalState?.stream}
                options={options}
                label={t("common.capability.stream", { device: device.display_name })}
                disabled={disabled}
                onChange={handleChange}
            />
        </>
    );
};
export default StreamSelector;

function getStreamIcon(stream: string): IconType {
    const lower = stream.toLocaleLowerCase();

    if (lower.includes("radio")) {
        return "streamRadio";
    }

    if (lower.includes("spotify")) {
        return "streamSpotify";
    }

    return "streamOther";
}
