import classNames from "classnames";
import { ChangeEvent, InputHTMLAttributes, MouseEvent, useCallback, useRef } from "react";
import Icon from "../Icon";

type SearchProps = {
    onSearch(search: string): void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;

const Search = ({ onSearch, className, ...props }: SearchProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();

            if (inputRef.current) {
                inputRef.current.value = "";
                onSearch("");
            }
        },
        [onSearch],
    );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            onSearch(event.target.value);
        },
        [onSearch],
    );

    return (
        <span>
            <Icon icon="search" className="absolute p-1.5" />

            <input
                {...props}
                type="search"
                autoComplete="off"
                className={classNames(
                    className,
                    "w-full pl-8 rounded bg-white dark:bg-black border-2 border-black dark:border-white",
                )}
                data-lpignore
                onChange={handleChange}
                ref={inputRef}
            />

            <button
                disabled={!inputRef.current?.value}
                className="absolute p-0.5 right-5 disabled:opacity-50"
                aria-label="Clear search"
                onClick={handleClear}
            >
                <Icon icon="clear" />
            </button>
        </span>
    );
};
export default Search;
