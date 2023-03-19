import { RefObject, useEffect } from "react";

export default function useOnClickOutside<THTMLElement extends HTMLElement>(
    ref: RefObject<THTMLElement>,
    handler: () => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref?.current?.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [handler, ref]);
}
