import { ComponentProps, HTMLAttributes, useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { uniqueId } from "underscore";

type TooltipOptions = Pick<ComponentProps<typeof Tooltip>, "place">;

type TooltipProps = {
    tooltipProps: Pick<ComponentProps<typeof Tooltip>, "place">;

    componentProps: HTMLAttributes<HTMLElement>;
};

/** Hook to setup the props for the component which shows the tooltip, and the tooltip itself. */
export default function useTooltip(options?: TooltipOptions): TooltipProps {
    return useMemo(() => {
        const id = uniqueId("tooltip");

        return {
            tooltipProps: {
                id,
                place: options?.place,
            },

            componentProps: {
                "data-tooltip-id": id,
            },
        };
    }, [options?.place]);
}
