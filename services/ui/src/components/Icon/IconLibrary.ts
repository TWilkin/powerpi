import { faGoogle, faSpotify } from "@fortawesome/free-brands-svg-icons";
import {
    faBatteryEmpty,
    faBatteryFull,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
    faBolt,
    faBurn,
    faChevronDown,
    faChevronUp,
    faCode,
    faComputer,
    faDoorClosed,
    faDoorOpen,
    faEllipsis,
    faEye,
    faEyeSlash,
    faGear,
    faGreaterThanEqual,
    faHistory,
    faHome,
    faHouseChimney,
    faHouseChimneyWindow,
    faInfoCircle,
    faLayerGroup,
    faLightbulb,
    faLock,
    faMobileRetro,
    faMoon,
    faMusic,
    faPanorama,
    faPlug,
    faPowerOff,
    faQuestion,
    faRadio,
    faSearch,
    faServer,
    faSpinner,
    faStopwatch,
    faSun,
    faTemperatureEmpty,
    faTemperatureFull,
    faThermometerHalf,
    faTint,
    faTowerBroadcast,
    faTv,
    faUnlock,
    faWalking,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

const iconLibrary = {
    logo: faPlug,
    loading: faSpinner,

    // login protocols
    google: faGoogle,

    // navigation
    home: faHome,
    device: faPlug,
    history: faHistory,
    settings: faGear,

    // state
    stateOn: faPowerOff,
    stateOff: faPowerOff,
    stateUnknown: faQuestion,

    // special states
    stateUnlocked: faUnlock,
    stateLocked: faLock,

    info: faInfoCircle,
    search: faSearch,
    clear: faXmark,
    close: faXmark,
    collapse: faChevronUp,
    expand: faChevronDown,

    visible: faEye,
    invisible: faEyeSlash,

    more: faEllipsis,

    // capabilities
    capability: faGear,
    brightnessLow: faMoon,
    brightnessHigh: faSun,
    colourTemperatureLow: faTemperatureEmpty,
    colourTemperatureHigh: faTemperatureFull,
    stream: faMusic,

    // battery level
    batteryEmpty: faBatteryEmpty,
    batteryQuarter: faBatteryQuarter,
    batteryHalf: faBatteryHalf,
    batteryThreeQuarters: faBatteryThreeQuarters,
    batteryFull: faBatteryFull,

    // devices
    deviceTv: faTv,
    deviceMusic: faMusic,
    deviceGroup: faLayerGroup,
    deviceCondition: faGreaterThanEqual,
    deviceComputer: faComputer,
    deviceDelay: faStopwatch,
    deviceLight: faLightbulb,
    deviceMutex: faLock,
    devicePairing: faTowerBroadcast,
    deviceScene: faPanorama,
    deviceServer: faServer,
    deviceSocket: faPlug,
    deviceVariable: faCode,
    deviceUnknown: faQuestion,

    // sensors
    sensorDoorOpen: faDoorOpen,
    sensorDoorClosed: faDoorClosed,
    sensorElectricity: faBolt,
    sensorGas: faBurn,
    sensorHumidity: faTint,
    sensorMotion: faWalking,
    sensorSwitch: faMobileRetro,
    sensorTemperature: faThermometerHalf,
    sensorWindowOpen: faHouseChimneyWindow,
    sensorWindowClosed: faHouseChimney,
    sensorUnknown: faQuestion,

    // streams
    streamRadio: faRadio,
    streamSpotify: faSpotify,
    streamOther: faMusic,
};

export type IconType = keyof typeof iconLibrary;

export default function getIcon(icon: IconType) {
    return iconLibrary[icon];
}
