import { Room as IRoom } from "@powerpi/common-api";
import { useCallback, useMemo } from "react";
import { chain as _ } from "underscore";
import DeviceIcon from "../Components/DeviceIcon";
import SensorIcon from "../Components/SensorIcon";
import useRoomDevices from "./useRoomDevices";

type RoomIconsProps = {
    room: IRoom;
    rotate: boolean;
};

const RoomIcons = ({ room, rotate }: RoomIconsProps) => {
    const devices = useRoomDevices(room.name);

    const { iconSize, iconPaddedSize, deviceCount, iconsWide, offsetX, offsetY } = useMemo(() => {
        const iconSize = 32;
        const iconPadding = 4;
        const iconPaddedSize = iconSize + 2 * iconPadding;

        // calculate the room size
        let width = room.width ?? 1;
        let height = room.height ?? 1;

        // this could put the icons outside the polygon so needs to be improved
        if (room.points) {
            width =
                Math.max(...room.points.map((point) => point.x)) -
                Math.min(...room.points.map((point) => point.x));

            height =
                Math.max(...room.points.map((point) => point.y)) -
                Math.min(...room.points.map((point) => point.y));
        }

        // next we need to find the centre of the room
        const centreX = width / 2 + (room.x ?? 0);
        const centreY = height / 2 + (room.y ?? 0);

        // how many icons can we fit?
        let iconsWide = Math.floor(width / iconPaddedSize);
        let iconsTall = Math.floor(height / iconPaddedSize);

        // we want to leave some space either side
        iconsWide = Math.max(iconsWide - 2, 0);
        iconsTall = Math.max(iconsTall - 2, 0);

        // limit them to what is necessary to centre everything
        const best = bestValue(devices.length, iconsWide, iconsTall, rotate);
        if (best) {
            iconsWide = best[0];
            iconsTall = best[1];
        }

        // how many devices can we actually show
        const deviceCount = Math.min(devices.length, iconsWide * iconsTall);

        // now we can work out the offsets
        const offsetX = centreX - (iconsWide * iconPaddedSize) / 2;
        const offsetY = centreY - (iconsTall * iconPaddedSize) / 2;

        return {
            iconSize,
            iconPaddedSize,
            deviceCount,
            iconsWide,
            offsetX,
            offsetY,
        };
    }, [devices.length, room.height, room.points, room.width, room.x, room.y, rotate]);

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

            if (rotate) {
                return `translate(${x} ${y}) rotate(-90, ${iconPaddedSize / 2} ${iconPaddedSize / 2})`;
            }

            return `translate(${x} ${y})`;
        },
        [iconPaddedSize, iconsWide, offsetX, offsetY, rotate],
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

                        {device.deviceType === "device" && (
                            <DeviceIcon type={device.type} width={iconSize} height={iconSize} />
                        )}

                        {device.deviceType === "sensor" && (
                            <SensorIcon
                                type={device.type}
                                state={device.state}
                                width={iconSize}
                                height={iconSize}
                            />
                        )}
                    </g>
                ))
                .value()}
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
function* feasibleFactors(count: number, rows: number, columns: number, rotate: boolean) {
    for (const [f1, f2] of increasingFactors(count, rows, columns)) {
        if (rotate) {
            if (f1 <= rows && f2 <= columns) {
                yield [f1, f2];
            } else if (f2 <= rows && f1 <= columns) {
                yield [f2, f1];
            }
        } else if (f1 <= columns && f2 <= rows) {
            yield [f2, f1];
        } else if (f2 <= columns && f1 <= rows) {
            yield [f1, f2];
        }
    }
}

/** Find the "best" factors of count in a grid of no more than rows x columns. */
function bestValue(count: number, rows: number, columns: number, rotate: boolean) {
    for (const factors of feasibleFactors(count, rows, columns, rotate)) {
        return factors;
    }

    return undefined;
}
