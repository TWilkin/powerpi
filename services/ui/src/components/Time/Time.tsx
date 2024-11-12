import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type TimeProps = {
    time: number;
};

/** Component to display how long since an event occurred, rounding appropriately and
 * collapsing to the largest whole unit.
 */
const Time = ({ time }: TimeProps) => {
    const { t } = useTranslation();

    const [now, setNow] = useState<Date>(new Date());

    const { date, isoDate, value, unit } = useMemo(() => {
        const date = new Date();
        date.setTime(time);

        const diff = time - now.getTime();
        const [value, unit] = findClosestUnit(diff);

        let actual = Math.round(value);
        if (diff < 0) {
            actual *= -1;
        }

        return {
            date,
            isoDate: date.toISOString(),
            value: actual,
            unit,
        };
    }, [now, time]);

    useEffect(() => {
        function getFrequency() {
            switch (unit) {
                case "second":
                    return 0.5 * 1000;

                case "minute":
                    return 30 * 1000;

                case "hour":
                    return 30 * 60 * 1000;

                default:
                    return undefined;
            }
        }

        const frequency = getFrequency();
        if (frequency) {
            const interval = setInterval(() => setNow(new Date()), frequency);

            return () => clearInterval(interval);
        }
    }, [unit]);

    if (time < 0) {
        return <>{t("common.never")}</>;
    }

    return (
        <time dateTime={isoDate} title={t("common.datetime.date", { time: date })}>
            {t(`common.datetime.relative.${unit}`, { time: value })}
        </time>
    );
};
export default Time;

type TimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

function findClosestUnit(ms: number, round = 0.8): [number, TimeUnit] {
    const absMs = Math.abs(ms);

    if (absMs >= 1000) {
        const seconds = absMs / 1000;
        if (seconds <= 60 * round) {
            return [seconds, "second"];
        }

        const minutes = seconds / 60;
        if (minutes <= 60 * round) {
            return [minutes, "minute"];
        }

        const hours = minutes / 60;
        if (hours <= 24 * round) {
            return [hours, "hour"];
        }

        const days = hours / 24;
        if (days <= 7 * round) {
            return [days, "day"];
        }

        const weeks = days / 7;
        if (weeks <= 4 * round) {
            return [weeks, "week"];
        }

        const months = days / 30;
        if (months <= 12 * round) {
            return [months, "month"];
        }

        const years = months / 12;
        return [years, "year"];
    }

    return [0, "second"];
}
