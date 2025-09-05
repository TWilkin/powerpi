import classNames from "classnames";
import { HTMLAttributes } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
    /** Whether the Panel should support scrolling. */
    scrollable?: boolean;
};

/** Component to display a panel box. */
const Panel = ({ children, scrollable = false, className, ...props }: PanelProps) => (
    <aside
        {...props}
        className={classNames(className, "p-2 rounded bg-bg-panel flex flex-col gap-1", {
            "max-h-[40vh] overflow-y-auto": scrollable,
        })}
    >
        {children}
    </aside>
);
export default Panel;
