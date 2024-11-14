import { DialogHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button";

type DialogProps = {
    heading?: string;
} & DialogHTMLAttributes<HTMLDialogElement>;

/** Modal Dialog component.
 * @see useDialog For how to open, populate with content and close.
 * @see DialogHost The host where the dialog will appear.
 */
const Dialog = forwardRef(
    ({ heading, children, ...props }: DialogProps, ref: ForwardedRef<HTMLDialogElement>) => {
        const { t } = useTranslation();

        return (
            <dialog
                {...props}
                className="backdrop:bg-gray-500/30 backdrop:backdrop-blur-sm"
                ref={ref}
            >
                <form method="dialog">
                    <header>
                        {heading}

                        <Button buttonType="icon" icon="close" aria-label={t("common.close")} />
                    </header>

                    {children}
                </form>
            </dialog>
        );
    },
);
Dialog.displayName = "Dialog";
export default Dialog;
