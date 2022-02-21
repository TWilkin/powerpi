import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import styles from "./Message.module.scss";

interface MessageProps {
    message: string;
    error?: boolean;
}

const Message = ({ message, error = false }: MessageProps) => {
    const icon = error ? faTriangleExclamation : faCircleInfo;

    return (
        <div className={classNames(styles.message, { [styles.error]: error })}>
            <FontAwesomeIcon icon={icon} />
            {` ${message}`}
        </div>
    );
};
export default Message;
