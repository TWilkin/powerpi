import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { PropsWithChildren } from "react";
import styles from "./Loading.module.scss";

type LoadingProps = PropsWithChildren<{
    loading: boolean;
    className?: string;
}>;

const Loading = ({ loading, className, children }: LoadingProps) =>
    loading ? (
        <div className={classNames(styles.loading, className)}>
            <FontAwesomeIcon icon={faSpinner} spin={true} />
        </div>
    ) : (
        <>{children}</>
    );
export default Loading;
