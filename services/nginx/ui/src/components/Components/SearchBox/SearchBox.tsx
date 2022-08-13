import { ChangeEvent, MouseEvent, useCallback, useRef } from "react";
import styles from "./SearchBox.module.scss";

interface SearchBoxProps {
    placeholder: string;
    value?: string;
    onChange: (search: string) => void;
}

const SearchBox = ({ placeholder, value, onChange }: SearchBoxProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        if (document.activeElement !== inputRef.current) {
            event.preventDefault();

            inputRef.current?.focus();
        }
    }, []);

    const onSearch = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
        [onChange]
    );

    return (
        <div className={styles.box} onClick={onClick}>
            <input
                type="search"
                placeholder={placeholder}
                onChange={onSearch}
                value={value}
                ref={inputRef}
            />
        </div>
    );
};
export default SearchBox;
