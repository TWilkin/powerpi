import useUserSettings from "../../../hooks/UserSettings";
import { keysOf } from "../../../util";
import UnitOption from "./UnitOption";

const UnitSettings = () => {
    const settings = useUserSettings();

    return (
        <div>
            {keysOf(settings.units).map((unit) => (
                <UnitOption key={unit} type={unit} currentUnit={settings.units[unit]} />
            ))}
        </div>
    );
};
export default UnitSettings;
