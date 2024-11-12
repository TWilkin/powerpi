import classNames from "classnames";
import { ChangeEvent, InputHTMLAttributes, MouseEvent, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button";
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
        <span className="relative">
            <Icon icon="search" className="absolute p-2" />

            <input
                {...props}
                type="search"
                value={value}
                autoComplete="off"
                className={classNames(
                    className,
                    "w-full h-8 pl-8 rounded bg-white dark:bg-black border-2 border-black dark:border-white",
                )}
                data-lpignore
                onChange={handleChange}
                ref={inputRef}
            />

            <Button
                buttonType="icon"
                icon="clear"
                disabled={value === ""}
                className="absolute top-1 right-1"
                aria-label={t("common.clear search")}
                onClick={handleClear}
            />
        </span>
    );
};
export default Search;
