import { useCallback, useLayoutEffect, useMemo, useState } from "react";

type Orientation = "landscape" | "portrait" | undefined;

export default function useOrientation() {
    const [orientation, setOrientation] = useState<Orientation>(getOrientation());

    const onOrientationChange = useCallback(
        () => setOrientation(getOrientation()),
        [setOrientation]
    );

    useLayoutEffect(() => {
        window.addEventListener("change", onOrientationChange);
        window.addEventListener("resize", onOrientationChange);

        return () => {
            window.removeEventListener("change", onOrientationChange);
            window.removeEventListener("resize", onOrientationChange);
        };
    }, [onOrientationChange]);

    const isLandscape = useMemo(() => orientation === "landscape", [orientation]);
    const isPortrait = useMemo(() => orientation === "portrait", [orientation]);

    return {
        isLandscape,
        isPortrait,
    };
}

function getOrientation(): Orientation {
    if (window.matchMedia("(orientation: portrait)").matches) {
        return "portrait";
    } else if (window.matchMedia("(orientation: landscape)").matches) {
        return "landscape";
    }

    return undefined;
}
