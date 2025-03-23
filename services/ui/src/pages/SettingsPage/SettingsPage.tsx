import LanguageSettings from "./Language";
import UnitSettings from "./Units";

const SettingsPage = () => (
    <div className="flex flex-col gap">
        <LanguageSettings />
        <UnitSettings />
    </div>
);
export default SettingsPage;
