import { ComponentProps, PropsWithChildren } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

type TooltipProps = PropsWithChildren<Pick<ComponentProps<typeof ReactTooltip>, "id" | "place">>;

/** A tooltip to show when hovering over and element.
 * Use alongside the @see useTooltip hook.
 */
const Tooltip = ({ children, ...props }: TooltipProps) => (
    <ReactTooltip {...props} className="!bg-purple-900 !text-white !rounded !text-sm z-50">
        {children}
    </ReactTooltip>
);

export default Tooltip;
