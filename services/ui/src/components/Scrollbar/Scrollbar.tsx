import classNames from "classnames";
import { HTMLAttributes, RefObject } from "react";

type ScrollbarProps = {
    direction?: "both" | "x" | "y";

    ref?: RefObject<HTMLDivElement | null>;
} & HTMLAttributes<HTMLDivElement>;

/** Component to make content scrollable. */
const Scrollbar = ({ direction = "both", className, children, ...props }: ScrollbarProps) => (
    <div
        {...props}
        className={classNames(className, "scrollbar-thin scrollbar-stable", {
            "overflow-x-auto": direction === "both" || direction === "x",
            "overflow-y-auto": direction === "both" || direction === "y",
        })}
    >
        {children}
    </div>
);
export default Scrollbar;
