import { forwardRef, PropsWithChildren, ReactPortal, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import styles from "./Dialog.module.scss";

type DialogBodyProps = PropsWithChildren<{ title: string }>;

type DialogProps = {
    closeDialog: () => void;
} & DialogBodyProps;

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

    return ReactDOM.createPortal(<DialogBody ref={bodyRef} {...bodyProps} />, element);
};
export default Dialog;

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(({ title, children }, ref) => (
    <div className={styles.backdrop}>
        <div ref={ref} className={styles.dialog}>
            <p>{title}</p>
            {children}
        </div>
    </div>
));
DialogBody.displayName = "DialogBody";
