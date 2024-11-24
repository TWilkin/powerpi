import classNames from "classnames";
import { DialogHTMLAttributes, ForwardedRef, forwardRef, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button";

type DialogProps = {
    icon?: ReactNode;

    heading?: string;
} & DialogHTMLAttributes<HTMLDialogElement>;

/** Modal Dialog component.
 * @see useDialog For how to open, populate with content and close.
 * @see DialogHost The host where the dialog will appear.
 */
const Dialog = forwardRef(
    ({ icon, heading, children, ...props }: DialogProps, ref: ForwardedRef<HTMLDialogElement>) => {
        const { t } = useTranslation();

        return (
            <dialog
                {...props}
                className={classNames(
                    "backdrop:bg-bg-backdrop/30 backdrop:backdrop-blur-sm",
                    "rounded",
                    "bg-bg text-text",
                    "border-2 border-outline",
                )}
                ref={ref}
            >
                <form method="dialog">
                    <header
                        className={classNames(
                            "p flex flex-row gap-4 justify-between items-center",
                            "bg-bg-primary",
                            "border-b-2 border-b-outline",
                        )}
                    >
                        {icon}

                        <h1 className="font-semibold">{heading}</h1>

                        <Button buttonType="icon" icon="close" aria-label={t("common.close")} />
                    </header>

                    <div className="p">{children}</div>
                </form>
            </dialog>
        );
    },
);
Dialog.displayName = "Dialog";
export default Dialog;
