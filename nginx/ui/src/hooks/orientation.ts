import { useCallback, useLayoutEffect, useMemo, useState } from "react";

type Orientation = "landscape" | "portrait";

export default function useOrientation() {
    const [orientation, setOrientation] = useState<Orientation>("landscape");

    const onOrientationChange = useCallback(() => {
        if (window.matchMedia("(orientation: portrait)").matches) {
            setOrientation("portrait");
        } else if (window.matchMedia("(orientation: landscape)").matches) {
            setOrientation("landscape");
        }
    }, [setOrientation]);

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
