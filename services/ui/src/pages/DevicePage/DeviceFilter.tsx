import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Panel, { usePanel } from "../../components/Panel";
import useDeviceFilter from "./useDeviceFilter";

type DeviceFilterProps = Pick<ReturnType<typeof usePanel>, "open"> &
    Pick<ReturnType<typeof useDeviceFilter>, "state" | "dispatch">;

/** Component representing the filters on the devices page. */
const DeviceFilter = ({ open, state, dispatch }: DeviceFilterProps) => {
    const { t } = useTranslation();

    const handleToggleVisible = useCallback(
        () => dispatch({ type: "VisibleOnly", visibleOnly: !state.visibleOnly }),
        [dispatch, state.visibleOnly],
    );

    return (
        <Panel open={open}>
            <label>
                <input type="checkbox" checked={state.visibleOnly} onClick={handleToggleVisible} />{" "}
                {t("pages.devices.filters.visible")}
            </label>
        </Panel>
    );
};
export default DeviceFilter;
