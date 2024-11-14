import { ReactNode, useCallback, useContext } from "react";
import DialogContext from "./DialogContext";

/** Hook to supporting opening and closing a dialog hosted by the DialogHost component.
 * @returns An object containing handleDialogOpen and handleDialogClose callbacks.
 *   - handleDialogOpen Opens the dialog with the provided content.
 *   - handleDialogClose Closes the dialog.
 */
export default function useDialog() {
    const { ref, setContent } = useContext(DialogContext);

    const handleDialogOpen = useCallback(
        (heading: string, content: ReactNode) => {
            if (ref && setContent) {
                setContent({ heading, children: content });

                ref?.current?.showModal();
            }
        },
        [ref, setContent],
    );

    const handleDialogClose = useCallback(() => {
        if (ref && setContent) {
            ref.current?.close();

            setContent(undefined);
        }
    }, [ref, setContent]);

    return {
        handleDialogOpen,
        handleDialogClose,
    };
}
