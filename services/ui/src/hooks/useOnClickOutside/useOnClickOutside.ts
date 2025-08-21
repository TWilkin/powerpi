import { useEffect, useRef } from "react";

/** Hook to perform an action when the user clicks outside the component. */
export default function useOnClickOutside<TElement extends HTMLElement>(handle: () => void) {
    const ref = useRef<TElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handle();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handle]);

    return ref;
}
