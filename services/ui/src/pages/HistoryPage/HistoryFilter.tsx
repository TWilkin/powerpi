import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import Panel from "../../components/Panel";
import SlideAnimation, { useSlideAnimation } from "../../components/SlideAnimation";
import useHistoryFilter from "./useHistoryFilter";

type HistoryFilterProps = Pick<ReturnType<typeof useSlideAnimation>, "open"> &
    Pick<ReturnType<typeof useHistoryFilter>, "state" | "dispatch" | "clear">;

/** Component representing the filters on the history page. */
const HistoryFilter = ({ open, clear }: HistoryFilterProps) => {
    const { t } = useTranslation();

    return (
        <SlideAnimation open={open}>
            <Panel>
                <Button icon="filter" className="self-start" onClick={clear}>
                    {t("common.clear filters")}
                </Button>
            </Panel>
        </SlideAnimation>
    );
};
export default HistoryFilter;
