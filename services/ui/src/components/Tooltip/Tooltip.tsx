import classNames from "classnames";
import { ComponentProps, PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";

type TooltipProps = PropsWithChildren<
    Pick<ComponentProps<typeof ReactTooltip>, "id" | "place" | "className">
>;

/** A tooltip to show when hovering over and element.
 * Use alongside the @see useTooltip hook.
 */
const Tooltip = ({ className, children, ...props }: TooltipProps) => (
    <>
        {createPortal(
            <ReactTooltip
                {...props}
                className={classNames(
                    className,
                    "!p-2 !rounded !text-sm z-50",
                    "!bg-purple-900 !text-white",
                )}
            >
                {children}
            </ReactTooltip>,
            document.body,
        )}
    </>
);

export default Tooltip;
