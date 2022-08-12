import { ChangeEvent, useCallback } from "react";
import styles from "./SearchBox.module.scss";

interface SearchBoxProps {
    placeholder: string;
    onChange: (search: string) => void;
}

const SearchBox = ({ placeholder, onChange }: SearchBoxProps) => {
    const onSearch = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
        [onChange]
    );

    return (
        <div className={styles.box}>
            <input type="search" placeholder={placeholder} onChange={onSearch} />
        </div>
    );
};
export default SearchBox;
