import DatePicker from "react-datepicker";
import "./DateFilter.scss";

interface DateFilterProps {
    name: string;
    selected: Date | undefined;
    onChange: (date: Date) => void;
}

const DateFilter = ({ name, selected, onChange }: DateFilterProps) => {
    const filterName = `${name}-date-filter`;

    // selected to nearest half-hour
    selected?.setMinutes(Math.ceil(selected.getMinutes() / 30) * 30);

    return (
        <div>
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
            />
        </div>
    );
};
export default DateFilter;
