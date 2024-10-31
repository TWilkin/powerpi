import { useLayoutEffect } from "react";
import { useCallback, useMemo, useState } from "react";

type Mode = "light" | "dark";

export default function useColourMode() {
    const [mode, setMode] = useState<Mode>();

    const onModeChange = useCallback(
        (event: MediaQueryListEvent) => setMode(event.matches ? "dark" : "light"),
        [setMode]
    );

    useLayoutEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        onModeChange({ matches: media.matches } as MediaQueryListEvent);

        media.addEventListener("change", onModeChange);

        return () => {
            media.removeEventListener("change", onModeChange);
        };
    }, [onModeChange]);

    const isLight = useMemo(() => mode === "light", [mode]);
    const isDark = useMemo(() => mode === "dark", [mode]);

    return {
        isLight,
        isDark,
    };
}
