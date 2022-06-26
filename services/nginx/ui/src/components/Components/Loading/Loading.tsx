import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ReactNode } from "react";
import styles from "./Loading.module.scss";

interface LoadingProps {
    loading: boolean;
    className?: string;
    children: ReactNode | undefined;
}

const Loading = ({ loading, className, children }: LoadingProps) =>
    loading ? (
        <div className={classNames(styles.loading, className)}>
            <FontAwesomeIcon icon={faSpinner} spin={true} />
        </div>
    ) : (
        <>{children}</>
    );
export default Loading;
