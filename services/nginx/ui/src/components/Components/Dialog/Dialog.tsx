import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    forwardRef,
    PropsWithChildren,
    ReactNode,
    ReactPortal,
    useEffect,
    useMemo,
    useRef,
} from "react";
import ReactDOM from "react-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import styles from "./Dialog.module.scss";

type DialogProps = PropsWithChildren<{
    title: string | ReactNode;
    closeDialog: () => void;
}>;

const Dialog = ({ closeDialog, ...bodyProps }: DialogProps): ReactPortal => {
    const bodyRef = useRef<HTMLDivElement>(null);

    const element = useMemo(() => document.createElement("div"), []);

    useOnClickOutside(bodyRef, closeDialog);

    useEffect(() => {
        document.body.appendChild(element);

        return () => {
            document.body.removeChild(element);
        };
    }, [element]);

    return ReactDOM.createPortal(
        <DialogBody ref={bodyRef} closeDialog={closeDialog} {...bodyProps} />,
        element
    );
};
export default Dialog;

const DialogBody = forwardRef<HTMLDivElement, DialogProps>(
    ({ title, closeDialog, children }, ref) => (
        <div className={styles.backdrop}>
            <div ref={ref} className={styles.dialog}>
                <div className={styles.header}>
                    {title}

                    <FontAwesomeIcon
                        className={styles.close}
                        icon={faXmark}
                        onClick={closeDialog}
                    />
                </div>

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    )
);
DialogBody.displayName = "DialogBody";
