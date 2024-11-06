import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faHome, faPlug, faSearch, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";

const iconLibrary = {
    logo: faPlug,
    loading: faSpinner,

    // login protocols
    google: faGoogle,

    // navigation
    home: faHome,
    device: faPlug,

    search: faSearch,
    clear: faXmark,
};

export type IconType = keyof typeof iconLibrary;

export default function getIcon(icon: IconType) {
    return iconLibrary[icon];
}
