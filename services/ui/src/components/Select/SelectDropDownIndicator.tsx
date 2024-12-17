import Icon from "../Icon";

type SelectDropDownIndicatorProps = {
    isMenuOpen: boolean;
};

const SelectDropDownIndicator = ({ isMenuOpen }: SelectDropDownIndicatorProps) => (
    <div className="p pointer-events-none">
        <Icon icon={isMenuOpen ? "collapse" : "expand"} />
    </div>
);
export default SelectDropDownIndicator;
