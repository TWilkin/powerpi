import Icon from "../Icon";

type SelectDropDownIndicatorProps = {
    isMenuOpen: boolean;
};

const SelectDropDownIndicator = ({ isMenuOpen }: SelectDropDownIndicatorProps) => (
    <div className="p-2">
        <Icon icon={isMenuOpen ? "collapse" : "expand"} />
    </div>
);
export default SelectDropDownIndicator;
