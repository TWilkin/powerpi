import { useCallback, useState } from "react";

/** Hook to control the Panel visibility. */
export default function usePanel() {
    const [open, setOpen] = useState(false);

    const handleToggle = useCallback(() => setOpen((current) => !current), []);

    return {
        open,
        handleToggle,
    };
}
