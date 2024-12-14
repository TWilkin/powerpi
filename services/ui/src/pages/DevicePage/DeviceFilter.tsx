import { ChangeEvent, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import CheckBox from "../../components/CheckBox";
import CheckBoxGroup from "../../components/CheckBoxGroup";
import DeviceIcon from "../../components/DeviceIcon";
import FieldSet from "../../components/FieldSet";
import Panel, { usePanel } from "../../components/Panel";
import useDeviceFilter from "./useDeviceFilter";

type DeviceFilterProps = Pick<ReturnType<typeof usePanel>, "open"> &
    Pick<
        ReturnType<typeof useDeviceFilter>,
        "state" | "types" | "locations" | "dispatch" | "clear"
    >;

/** Component representing the filters on the devices page. */
const DeviceFilter = ({ open, state, types, locations, dispatch, clear }: DeviceFilterProps) => {
    const { t } = useTranslation();

    const typeOptions = useMemo(
        () =>
            types.map((type) => ({
                value: type,
                label: (
                    <>
                        <DeviceIcon type={type} />
                        {` ${type}`}
                    </>
                ),
            })),
        [types],
    );

    const handleTypeSelection = useCallback(
        (types: string[]) => dispatch({ type: "Types", types }),
        [dispatch],
    );

    const locationOptions = useMemo(
        () =>
            locations.map((location) => ({
                value: location,
                label: location ?? t("common.unspecified"),
            })),
        [locations, t],
    );

    const handleLocationSelection = useCallback(
        (locations: string[]) => dispatch({ type: "Locations", locations }),
        [dispatch],
    );

    const handleVisibleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) =>
            dispatch({ type: "VisibleOnly", visibleOnly: event.target.checked }),
        [dispatch],
    );

    return (
        <Panel open={open}>
            <FieldSet legend={t("pages.devices.filters.types")}>
                <CheckBoxGroup
                    options={typeOptions}
                    selections={state.types}
                    onChange={handleTypeSelection}
                />
            </FieldSet>

            <FieldSet legend={t("pages.devices.filters.locations")}>
                <CheckBoxGroup
                    options={locationOptions}
                    selections={state.locations}
                    onChange={handleLocationSelection}
                />
            </FieldSet>

            <FieldSet legend={t("pages.devices.filters.visibility.label")}>
                <CheckBox
                    label={t("pages.devices.filters.visibility.option")}
                    checked={state.visibleOnly}
                    onChange={handleVisibleChange}
                />
            </FieldSet>

            <Button icon="filter" className="self-start" onClick={clear}>
                {t("pages.devices.filters.clear")}
            </Button>
        </Panel>
    );
};
export default DeviceFilter;
