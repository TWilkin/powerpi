import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
    faCode,
    faComputer,
    faEye,
    faEyeSlash,
    faGear,
    faGreaterThanEqual,
    faHistory,
    faHome,
    faInfoCircle,
    faLayerGroup,
    faLightbulb,
    faLock,
    faMoon,
    faMusic,
    faPanorama,
    faPlug,
    faPowerOff,
    faQuestion,
    faSearch,
    faServer,
    faSpinner,
    faStopwatch,
    faSun,
    faTowerBroadcast,
    faTv,
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

    // state
    stateOn: faPowerOff,
    stateOff: faPowerOff,
    stateUnknown: faQuestion,

    info: faInfoCircle,
    search: faSearch,
    clear: faXmark,
    close: faXmark,

    visible: faEye,
    invisible: faEyeSlash,

    // capabilities
    capability: faGear,
    brightnessLow: faMoon,
    brightnessHigh: faSun,

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
};

export type IconType = keyof typeof iconLibrary;

export default function getIcon(icon: IconType) {
    return iconLibrary[icon];
}
