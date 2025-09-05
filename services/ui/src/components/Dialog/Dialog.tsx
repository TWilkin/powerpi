import classNames from "classnames";
import { DialogHTMLAttributes, ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button";
import { PortalHost } from "../PortalHost";

type DialogProps = {
    icon?: ReactNode;

    heading?: string;

    ref: RefObject<HTMLDialogElement | null>;
} & DialogHTMLAttributes<HTMLDialogElement>;

/** Modal Dialog component.
 * @see useDialog For how to open, populate with content and close.
 * @see DialogHost The host where the dialog will appear.
 */
const Dialog = ({ icon, heading, children, ref, ...props }: DialogProps) => {
    const { t } = useTranslation();

    return (
        <dialog
            {...props}
            className={classNames(
                "backdrop:bg-bg-backdrop/30 backdrop:backdrop-blur-sm",
                "rounded",
                "bg-bg text-text",
                "border border-outline",
            )}
            ref={ref}
        >
            <form method="dialog">
                <PortalHost>
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
                </PortalHost>
            </form>
        </dialog>
    );
};
export default Dialog;
