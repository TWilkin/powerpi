import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loader = () => (
    <div role="alert" aria-label="Loading">
        <FontAwesomeIcon icon={faSpinner} spin />
    </div>
);
export default Loader;
