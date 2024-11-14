import { ForwardedRef, forwardRef, PropsWithChildren, useMemo, useRef, useState } from "react";
import Dialog from "./Dialog";
import DialogContext, { DialogContentType } from "./DialogContext";
import useDialog from "./useDialog";

/** The context and DOM position host for dialogs.
 * @see useDialog For how to open, populate with content, and close the dialog.
 */
const DialogHost = ({ children }: PropsWithChildren<unknown>) => {
    const ref = useRef<HTMLDialogElement>(null);

    const [content, setContent] = useState<DialogContentType>();

    const context = useMemo(
        () => ({
            ref,
            setContent,
        }),
        [],
    );

    return (
        <DialogContext.Provider value={context}>
            {children}

            <DialogWrapper content={content} ref={ref} />
        </DialogContext.Provider>
    );
};
export default DialogHost;

type DialogWrapperProps = {
    content: DialogContentType | undefined;
};

const DialogWrapper = forwardRef(
    ({ content }: DialogWrapperProps, ref: ForwardedRef<HTMLDialogElement>) => {
        const { handleDialogClose } = useDialog();

        return <Dialog {...content} onClose={handleDialogClose} ref={ref} />;
    },
);
DialogWrapper.displayName = "DialogWrapper";
