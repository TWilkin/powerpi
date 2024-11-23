import { Room } from "@powerpi/common-api";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chain as _ } from "underscore";
import DeviceIcon from "../../../components/DeviceIcon";
import Icon from "../../../components/Icon";
import SensorIcon from "../../../components/SensorIcon";
import { isPolygonRoom } from "./ViewBox";
import useRoomDevices from "./useRoomDevices";

type RoomIconsProps = {
    room: Room;
};

/** Component to display device/sensor icons in a room on the floorplan. */
const RoomIcons = ({ room }: RoomIconsProps) => {
    const { t } = useTranslation();

    const devices = useRoomDevices(room.name);

    const { scale, iconPaddedSize, deviceCount, iconsWide, offsetX, offsetY } = useMemo(() => {
        const iconSize = 40;
        const iconPadding = 4;
        const iconPaddedSize = iconSize + 2 * iconPadding;

        const scale = 1 / (1024 / iconSize);

        // calculate the room size
        let x = room.x ?? 0;
        let y = room.y ?? 0;
        let width = 0;
        let height = 0;

        // this could put the icons outside the polygon so needs to be improved
        if (isPolygonRoom(room)) {
            x = Math.min(...room.points.map((point) => point.x));
            y = Math.min(...room.points.map((point) => point.y));

            width = Math.max(...room.points.map((point) => point.x)) - x;
            height = Math.max(...room.points.map((point) => point.y)) - y;
        } else {
            width = room.width ?? 0;
            height = room.height ?? 0;
        }

        // next we need to find the centre of the room
        const centreX = width / 2 + x;
        const centreY = height / 2 + y;

        // how many icons can we fit?
        let iconsWide = Math.floor(width / iconPaddedSize);
        let iconsTall = Math.floor(height / iconPaddedSize);

        // we want to leave some space either side
        iconsWide = Math.max(iconsWide - 2, 0);
        iconsTall = Math.max(iconsTall - 2, 0);

        // limit them to what is necessary to centre everything
        const best = bestValue(devices.length, iconsWide, iconsTall);
        if (best) {
            iconsWide = best[0];
            iconsTall = best[1];
        }

        // how many devices can we actually show
        let deviceCount = Math.min(devices.length, iconsWide * iconsTall);
        if (deviceCount < devices.length) {
            // if we have too many devices we'll show an ellipsis instead of the last one
            deviceCount--;
        }

        // now we can work out the offsets
        const offsetX = centreX - (iconsWide * iconPaddedSize) / 2;
        const offsetY = centreY - (iconsTall * iconPaddedSize) / 2;

        return {
            scale,
            iconPaddedSize,
            deviceCount,
            iconsWide,
            offsetX,
            offsetY,
        };
    }, [devices.length, room]);

    const getTransform = useCallback(
        (index: number) => {
            // find out which row and column it's in
            let row = 0;
            while (index >= (row + 1) * iconsWide) {
                row++;
            }
            const column = index - row * iconsWide;

            // now we can work out the position
            const x = offsetX + column * iconPaddedSize;
            const y = offsetY + row * iconPaddedSize;

            return `translate(${x} ${y}) scale(${scale})`;
        },
        [iconPaddedSize, iconsWide, offsetX, offsetY, scale],
    );

    return (
        <>
            {_(devices)
                .first(deviceCount)
                .map((device, i) => (
                    <g key={`${device.deviceType}_${device.type}`} transform={getTransform(i)}>
                        <title>
                            {device.type} ({device.count})
                        </title>

                        {device.deviceType === "device" && <DeviceIcon type={device.type} />}

                        {device.deviceType === "sensor" && (
                            <SensorIcon type={device.type} state={device.state} />
                        )}
                    </g>
                ))
                .value()}

            {deviceCount < devices.length && (
                <g transform={getTransform(deviceCount)}>
                    <title>
                        {t("pages.home.more devices", { count: devices.length - deviceCount })}
                    </title>

                    <Icon icon="more" />
                </g>
            )}
        </>
    );
};
export default RoomIcons;

/** Generate factors for value starting with the values closes to the square root. */
function* factors(value: number) {
    const range = Math.floor(Math.sqrt(value));

    for (let i = range; i >= 1; i--) {
        if (value % i === 0) {
            yield [i, value / i];
        }
    }
}

/** Generate factors between count and rows * columns, in case the factors of count won't fit. */
function* increasingFactors(count: number, rows: number, columns: number) {
    const maxCount = Math.min(count, rows * columns);

    for (let i = maxCount; i <= rows * columns; i++) {
        for (const f of factors(i)) {
            yield f;
        }
    }
}

/** Generate factors of count that will work for the rows and columns. */
function* feasibleFactors(count: number, rows: number, columns: number) {
    for (const [f1, f2] of increasingFactors(count, rows, columns)) {
        if (f1 <= columns && f2 <= rows) {
            yield [f2, f1];
        } else if (f2 <= columns && f1 <= rows) {
            yield [f1, f2];
        }
    }
}

/** Find the "best" factors of count in a grid of no more than rows x columns. */
function bestValue(count: number, rows: number, columns: number) {
    for (const factors of feasibleFactors(count, rows, columns)) {
        return factors;
    }

    return undefined;
}
