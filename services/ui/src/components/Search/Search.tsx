import classNames from "classnames";
import { ChangeEvent, InputHTMLAttributes, MouseEvent, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../Icon";

type SearchProps = {
    value: string;

    onSearch(search: string): void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;

const Search = ({ onSearch, value, className, ...props }: SearchProps) => {
    const { t } = useTranslation();

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
                value={value}
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
                disabled={value === ""}
                className="absolute p-0.5 right-5 disabled:opacity-50"
                aria-label={t("common.clear search")}
                onClick={handleClear}
            >
                <Icon icon="clear" />
            </button>
        </span>
    );
};
export default Search;
