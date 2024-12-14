import classNames from "classnames";
import { PropsWithChildren } from "react";
import usePanel from "./usePanel";

type PanelProps = PropsWithChildren<Pick<ReturnType<typeof usePanel>, "open">>;

/** Component to display a panel which will slide into view when opened,
 * e.g. for the page's filters.
 */
const Panel = ({ open, children }: PanelProps) => {
    return (
        <div
            className={classNames("grid transition-grid duration-500", {
                "grid-rows-[1fr]": open,
                "grid-rows-[0fr]": !open,
            })}
        >
            <div className="overflow-hidden">
                <aside className="p-2 rounded bg-bg-panel flex flex-col gap-1">{children}</aside>
            </div>
        </div>
    );
};
export default Panel;
