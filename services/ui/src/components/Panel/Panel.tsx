import { HTMLAttributes } from "react";

type PanelProps = HTMLAttributes<HTMLElement>;

/** Component to display a panel box. */
const Panel = ({ children, ...props }: PanelProps) => (
    <aside {...props} className="p-2 rounded bg-bg-panel flex flex-col gap-1">
        {children}
    </aside>
);
export default Panel;
