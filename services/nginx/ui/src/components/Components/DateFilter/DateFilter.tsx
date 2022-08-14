import DatePicker from "react-datepicker";
import styles from "./DateFilter.module.scss";
import "./DateFilter.scss";

interface DateFilterProps {
    name: string;
    selected: Date | null | undefined;
    onChange: (date: Date) => void;
}

const DateFilter = ({ name, selected, onChange }: DateFilterProps) => {
    const filterName = `${name}-date-filter`;

    // selected to nearest half-hour
    selected?.setMinutes(Math.ceil(selected.getMinutes() / 30) * 30);

    console.log(selected?.toISOString());

    return (
        <div className={styles.filter}>
            <label htmlFor={filterName}>{name}: </label>

            <DatePicker
                name={filterName}
                selected={selected}
                onChange={onChange}
                showTimeSelect
                calendarStartDay={1}
                dateFormat="d MMMM yyyy HH:mm"
                timeFormat="HH:mm"
                maxDate={new Date()}
                isClearable
            />
        </div>
    );
};
export default DateFilter;
