import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import FieldSet from "../../components/FieldSet";
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

    const handleClearClick = useCallback(() => dispatch({ type: "Clear" }), [dispatch]);

    return (
        <Panel open={open}>
            <FieldSet legend="Visibility">
                <label>
                    <input
                        type="checkbox"
                        checked={state.visibleOnly}
                        onClick={handleToggleVisible}
                    />{" "}
                    {t("pages.devices.filters.visible")}
                </label>
            </FieldSet>

            <Button icon="filter" className="self-start" onClick={handleClearClick}>
                {t("pages.devices.filters.clear")}
            </Button>
        </Panel>
    );
};
export default DeviceFilter;
