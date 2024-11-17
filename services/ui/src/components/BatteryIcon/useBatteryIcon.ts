import { useCallback, useEffect, useRef, useState } from "react";
import { IconType } from "../Icon";

const icons: { [key: number]: IconType[] } = {
    100: ["batteryThreeQuarters", "batteryFull"],
    75: ["batteryFull", "batteryThreeQuarters"],
    50: ["batteryFull", "batteryThreeQuarters", "batteryHalf"],
    25: ["batteryFull", "batteryThreeQuarters", "batteryHalf", "batteryQuarter"],
    0: ["batteryFull", "batteryThreeQuarters", "batteryHalf", "batteryQuarter", "batteryEmpty"],
};

export default function useBatteryIcon(battery: number | undefined, charging: boolean | undefined) {
    const interval = useRef<NodeJS.Timeout>();

    const [icon, setIcon] = useState(battery != null ? icons[getLevel(battery)].at(-1) : undefined);

    const animate = useCallback((level: number) => {
        const animationIcons = icons[level];

        setIcon((currentIcon) => {
            // which icon is it currently
            let index = animationIcons.findIndex((icon) => icon === currentIcon);

            // update to the next icon
            index--;
            if (index < 0) {
                index = animationIcons.length - 1;
            }

            return animationIcons[index];
        });
    }, []);

    useEffect(() => {
        if (battery != null) {
            const level = getLevel(battery);
            const animationIcons = icons[level];

            if (charging) {
                if (interval.current) {
                    clearInterval(interval.current);
                    interval.current = undefined;
                }

                interval.current = setInterval(() => animate(level), 1000);
            } else {
                setIcon(animationIcons.at(-1));
            }
        }

        return () => {
            if (interval.current) {
                clearInterval(interval.current);
            }
        };
    }, [animate, battery, charging]);

    return icon;
}

function getLevel(battery: number) {
    if (battery <= 5) {
        return 0;
    }

    if (battery <= 25) {
        return 25;
    }

    if (battery <= 50) {
        return 50;
    }

    if (battery <= 75) {
        return 75;
    }

    return 100;
}
