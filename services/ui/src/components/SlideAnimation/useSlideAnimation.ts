import { useCallback, useState } from "react";

/** Hook to control the SlideAnimation visibility. */
export default function useSlideAnimation() {
    const [open, setOpen] = useState(false);

    const handleToggle = useCallback(() => setOpen((current) => !current), []);

    return {
        open,
        handleToggle,
    };
}
