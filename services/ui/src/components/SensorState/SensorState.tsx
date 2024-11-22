import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import isSupportedSensorState from "./isSupportedSensorState";

type SensorStateProps = {
    state?: string;
};

/** Component to display the translated sensor state, if supported. */
const SensorState = ({ state }: SensorStateProps) => {
    const { t } = useTranslation();

    const key = useMemo(
        () => (state && isSupportedSensorState(state) ? state : undefined),
        [state],
    );

    if (!state) {
        return <></>;
    }

    if (!key) {
        return <>{state}</>;
    }

    return <>{t(`common.sensors.states.${key}`)}</>;
};
export default SensorState;
