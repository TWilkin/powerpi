import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Loading.module.scss";

interface LoadingProps {
    loading: boolean;
    children: JSX.Element | JSX.Element[] | undefined;
}

const Loading = ({ loading, children }: LoadingProps) =>
    loading ? (
        <div className={styles.loading}>
            <FontAwesomeIcon icon={faSpinner} spin={true} />
        </div>
    ) : (
        <>{children}</>
    );
export default Loading;
