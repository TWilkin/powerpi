import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faHome, faPlug, faSpinner } from "@fortawesome/free-solid-svg-icons";

const iconLibrary = {
    logo: faPlug,
    loading: faSpinner,

    // login protocols
    google: faGoogle,

    // navigation
    home: faHome,
    device: faPlug,
};

export type IconType = keyof typeof iconLibrary;

export default function getIcon(icon: IconType) {
    return iconLibrary[icon];
}
