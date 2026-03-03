import classNames from "classnames";
import { ComponentProps, PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { usePortalHost } from "../PortalHost";

type TooltipProps = PropsWithChildren<
    Pick<ComponentProps<typeof ReactTooltip>, "id" | "place" | "className">
>;

/** A tooltip to show when hovering over and element.
 * Use alongside the @see useTooltip hook.
 */
const Tooltip = ({ className, children, ...props }: TooltipProps) => {
    const { tooltipHost, getElementByHostId } = usePortalHost();

    return (
        <>
            {createPortal(
                <ReactTooltip
                    {...props}
                    className={classNames(
                        className,
                        "!p !rounded !text-sm",
                        "!bg-bg-primary !text-text",
                    )}
                >
                    {children}
                </ReactTooltip>,
                getElementByHostId(tooltipHost),
            )}
        </>
    );
};
export default Tooltip;
