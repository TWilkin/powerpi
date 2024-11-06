import classNames from "classnames";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import Icon from "../Icon";

type SearchProps = {
    onSearch(search: string): void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const Search = ({ onChange, onSearch, className, ...props }: SearchProps) => {
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange(event);
            }

            onSearch(event.target.value);
        },
        [onChange, onSearch],
    );

    return (
        <span>
            <Icon icon="search" className="absolute p-2" />

            <input
                {...props}
                type="search"
                autoComplete="off"
                className={classNames(
                    className,
                    "w-full pl-8 p-1 rounded bg-white dark:bg-black border-2 border-black dark:border-white",
                )}
                data-lpignore
                onChange={handleChange}
            />
        </span>
    );
};
export default Search;
