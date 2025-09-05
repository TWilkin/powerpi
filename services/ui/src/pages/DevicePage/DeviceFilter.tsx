import { ChangeEvent, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chain as _ } from "underscore";
import Button from "../../components/Button";
import CheckBox from "../../components/CheckBox";
import CheckBoxGroup from "../../components/CheckBoxGroup";
import DeviceIcon from "../../components/DeviceIcon";
import FieldSet from "../../components/FieldSet";
import Panel from "../../components/Panel";
import SlideAnimation, { useSlideAnimation } from "../../components/SlideAnimation";
import useLocations from "../../hooks/useLocations";
import useDeviceFilter from "./useDeviceFilter";

type DeviceFilterProps = Pick<ReturnType<typeof useSlideAnimation>, "open"> &
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

    const rooms = useLocations();
    const locationOptions = useMemo(
        () =>
            _(locations)
                .map((location) => {
                    const room = rooms.find((room) => room.name === location);

                    return {
                        value: location,
                        label:
                            room?.display_name ?? room?.name ?? location ?? t("common.unspecified"),
                    };
                })
                .sortBy((option) => option.label.toLocaleLowerCase())
                .value(),
        [locations, rooms, t],
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
        <SlideAnimation open={open}>
            <Panel scrollable>
                <FieldSet legend={t("pages.devices.filters.types")} content="checkbox">
                    <CheckBoxGroup
                        options={typeOptions}
                        selections={state.types}
                        onChange={handleTypeSelection}
                    />
                </FieldSet>

                <FieldSet legend={t("pages.devices.filters.locations")} content="checkbox">
                    <CheckBoxGroup
                        options={locationOptions}
                        selections={state.locations}
                        onChange={handleLocationSelection}
                    />
                </FieldSet>

                <FieldSet legend={t("pages.devices.filters.visibility.label")} content="checkbox">
                    <CheckBox
                        label={t("pages.devices.filters.visibility.option")}
                        checked={state.visibleOnly}
                        onChange={handleVisibleChange}
                    />
                </FieldSet>

                <Button icon="filter" className="self-start" onClick={clear}>
                    {t("common.clear filters")}
                </Button>
            </Panel>
        </SlideAnimation>
    );
};
export default DeviceFilter;
