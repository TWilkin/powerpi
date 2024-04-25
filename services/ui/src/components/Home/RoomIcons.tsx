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

        // how many devices can we actually show
        const deviceCount = Math.min(devices.length, iconsWide * iconsTall);

        // limit them to what is necessary to centre everything
        const best = bestValue(deviceCount, iconsWide, iconsTall, rotate);
        if (best) {
            iconsWide = best[0];
            iconsTall = best[1];
        }

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
        (type: string, index: number) => {
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
                    <g
                        key={`${device.deviceType}_${device.type}`}
                        transform={getTransform(device.type, i)}
                    >
                        <title>
                            {device.type} ({device.count})
                        </title>

                        {device.deviceType === "device" && (
                            <DeviceIcon type={device.type} width={iconSize} height={iconSize} />
                        )}

                        {device.deviceType === "sensor" && (
                            <SensorIcon type={device.type} width={iconSize} height={iconSize} />
                        )}
                    </g>
                ))
                .value()}
        </>
    );
};
export default RoomIcons;

function* factors(value: number) {
    const range = Math.floor(Math.sqrt(value));

    for (let i = 1; i <= range; i++) {
        if (value % i === 0) {
            yield [i, value / i];
        }
    }
}

function* feasibleFactors(count: number, rows: number, columns: number, rotate: boolean) {
    for (const [f1, f2] of factors(count)) {
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

function bestValue(count: number, rows: number, columns: number, rotate: boolean) {
    return _([...feasibleFactors(count, rows, columns, rotate)])
        .reverse()
        .first()
        .value();
}
