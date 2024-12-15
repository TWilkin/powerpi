import classNames from "classnames";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import useSlideAnimation from "./useSlideAnimation";

type SlideAnimationProps = Pick<ReturnType<typeof useSlideAnimation>, "open"> &
    HTMLAttributes<HTMLDivElement>;

/** Component to animate the height of the child component sliding up/down
 * when opening/closing respectively.
 */
const SlideAnimation = ({ open, children, ...props }: SlideAnimationProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const previous = useRef(open);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        function handleTransitionStart() {
            setAnimating(true);
        }

        function handleTransitionEnd() {
            setAnimating(false);
        }

        const current = ref.current;

        if (current) {
            current.addEventListener("transitionstart", handleTransitionStart);
            current.addEventListener("transitionend", handleTransitionEnd);
        }

        return () => {
            if (current) {
                current.removeEventListener("transitionstart", handleTransitionStart);
                current.removeEventListener("transitionend", handleTransitionEnd);
            }
        };
    }, []);

    // we want to detect when there is a change in open state
    const changed = previous.current !== open;
    useEffect(() => {
        if (previous.current !== open) {
            previous.current = open;
        }
    }, [open]);

    return (
        <div
            {...props}
            className={classNames("grid transition-grid duration-500", {
                "grid-rows-[1fr]": open,
                "grid-rows-[0fr]": !open,
            })}
            ref={ref}
        >
            {(open || changed || animating) && <div className="overflow-hidden">{children}</div>}
        </div>
    );
};
export default SlideAnimation;
