import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import FieldSet from "../../components/FieldSet";
import Panel from "../../components/Panel";
import SlideAnimation, { useSlideAnimation } from "../../components/SlideAnimation";
import useQueryHistoryActions from "../../queries/useQueryHistoryActions";
import useQueryHistoryEntities from "../../queries/useQueryHistoryEntities";
import useQueryHistoryTypes from "../../queries/useQueryHistoryTypes";
import HistoryPathFilter from "./HistoryPathFilter";
import useHistoryFilter from "./useHistoryFilter";

type HistoryFilterProps = Pick<ReturnType<typeof useSlideAnimation>, "open"> &
    Pick<ReturnType<typeof useHistoryFilter>, "state" | "dispatch" | "clear">;

/** Component representing the filters on the history page. */
const HistoryFilter = ({ open, state, clear, dispatch }: HistoryFilterProps) => {
    const { t } = useTranslation();

    const { data: types, isFetching: typesFetching } = useQueryHistoryTypes();
    const { data: entities, isFetching: entitiesFetching } = useQueryHistoryEntities();
    const { data: actions, isFetching: actionsFetching } = useQueryHistoryActions();

    const handleTypesChange = useCallback(
        (type: string | undefined) => dispatch({ type: "Type", _type: type }),
        [dispatch],
    );

    const handleEntitiesChange = useCallback(
        (entity: string | undefined) => dispatch({ type: "Entity", entity }),
        [dispatch],
    );

    const handleActionsChange = useCallback(
        (action: string | undefined) => dispatch({ type: "Action", action }),
        [dispatch],
    );

    return (
        <SlideAnimation open={open}>
            <Panel scrollable>
                <FieldSet legend={t("pages.history.filters.path")}>
                    <HistoryPathFilter
                        path="types"
                        value={state.type}
                        data={types}
                        isFetching={typesFetching}
                        onChange={handleTypesChange}
                    />

                    <HistoryPathFilter
                        path="entities"
                        value={state.entity}
                        data={entities}
                        isFetching={entitiesFetching}
                        onChange={handleEntitiesChange}
                    />

                    <HistoryPathFilter
                        path="actions"
                        value={state.action}
                        data={actions}
                        isFetching={actionsFetching}
                        onChange={handleActionsChange}
                    />
                </FieldSet>

                <Button icon="filter" className="self-start" onClick={clear}>
                    {t("common.clear filters")}
                </Button>
            </Panel>
        </SlideAnimation>
    );
};
export default HistoryFilter;
