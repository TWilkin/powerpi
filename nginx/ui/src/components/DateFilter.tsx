import React from "react";
import DatePicker from "react-datepicker";

interface DateFilterProps {
    name: string;
    selected: Date | undefined;
    onChange: (date: Date) => void;
}

const DateFilter = ({ name, selected, onChange }: DateFilterProps) => {
    const filterName = `${name}-date-filter`;
    return (
        <div>
            <label htmlFor={filterName}>{name}: </label>
            <DatePicker
                name={filterName}
                selected={selected}
                onChange={onChange}
                showTimeSelect
                dateFormat="d MMMM yyyy HH:mm"
                timeFormat="HH:mm"
                maxDate={new Date()}
            />
        </div>
    );
};
export default DateFilter;
