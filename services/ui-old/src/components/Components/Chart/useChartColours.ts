import { useMemo } from "react";
import useColourMode from "../../../hooks/colour";
import scss from "../../../styles/exports.module.scss";

const lineColourRegex = /,\s*/;

export default function useChartColours() {
    const { isDark } = useColourMode();

    // set the chart colours in light/dark mode
    return useMemo(() => {
        if (isDark) {
            return {
                textColour: scss.darkText,
                lineColour: scss.darkChartLine,
                tooltipColour: scss.darkMenu,
                lineColours: scss.darkChart.split(lineColourRegex),
            };
        }

        return {
            textColour: scss.lightText,
            lineColour: scss.lightChartLine,
            tooltipColour: scss.lightMenu,
            lineColours: scss.lightChart.split(lineColourRegex),
        };
    }, [isDark]);
}
