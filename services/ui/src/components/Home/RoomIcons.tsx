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

    console.log(rotate);

    const { iconSize, iconPaddedSize, deviceCount, iconsWide, iconsTall, offsetX, offsetY } =
        useMemo(() => {
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

            console.log("centre", centreX, centreY);

            // how many icons can we fit?
            let iconsWide = Math.floor(width / iconPaddedSize);
            let iconsTall = Math.floor(height / iconPaddedSize);

            // we want to leave some space either side
            iconsWide = Math.max(iconsWide - 2, 0);
            iconsTall = Math.max(iconsTall - 2, 0);

            // now we know what the limits are, arrange what we want
            if (iconsWide >= devices.length) {
                iconsTall = 1;
            }
            const deviceCount = Math.min(devices.length, iconsWide * iconsTall);

            // limit them to what is necessary to centre everything
            const best = bestValue(deviceCount, iconsWide, iconsTall);
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
                iconsTall,
                offsetX,
                offsetY,
            };
        }, [devices.length, room.height, room.points, room.width, room.x, room.y]);

    console.log(room);
    console.log(room.name, deviceCount, iconsWide, "x", iconsTall, "offset", offsetX, ",", offsetY);

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

            console.log(type, index, ":", row, ",", column, " ", x, ",", y);

            const translate = `translate(${x}, ${y})`;

            if (rotate) {
                return `${translate} rotate(-90)`;
            }

            return translate;
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

function* feasibleFactors(count: number, rows: number, columns: number) {
    for (const f of factors(count)) {
        if (f[0] <= rows && f[1] <= columns) {
            yield [f[0], f[1]];
        } else if (f[1] <= rows && f[0] <= columns) {
            yield [f[1], f[0]];
        }
    }
}

function bestValue(count: number, rows: number, columns: number) {
    return _([...feasibleFactors(count, rows, columns)])
        .reverse()
        .first()
        .value();
}
