import { useCallback, useLayoutEffect, useState } from "react";

export default function useNarrow() {
    const [narrow, setNarrow] = useState(getNarrow());

    const onWindowChange = useCallback(() => setNarrow(getNarrow()), [setNarrow]);

    useLayoutEffect(() => {
        window.addEventListener("change", onWindowChange);
        window.addEventListener("resize", onWindowChange);

        return () => {
            window.removeEventListener("change", onWindowChange);
            window.removeEventListener("resize", onWindowChange);
        };
    }, [onWindowChange]);

    return {
        isNarrow: narrow,
    };
}

function getNarrow() {
    return window.matchMedia("(max-width: 500px)").matches;
}
