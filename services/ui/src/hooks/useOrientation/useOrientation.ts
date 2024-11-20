import { useCallback, useEffect, useState } from "react";

type Orientation = "landscape" | "portrait" | undefined;

/** Hook to retrieve whether the page is currently landscape or portrait. */
export default function useOrientation() {
    const [orientation, setOrientation] = useState<Orientation>(getOrientation());

    const handleOrientationChange = useCallback(() => setOrientation(getOrientation()), []);

    useEffect(() => {
        window.addEventListener("change", handleOrientationChange);
        window.addEventListener("resize", handleOrientationChange);

        return () => {
            window.removeEventListener("change", handleOrientationChange);
            window.removeEventListener("resize", handleOrientationChange);
        };
    }, [handleOrientationChange]);

    const isLandscape = orientation === "landscape";
    const isPortrait = orientation === "portrait";

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
