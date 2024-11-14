import { createContext, Dispatch, PropsWithChildren, RefObject, SetStateAction } from "react";

export type DialogContentType = PropsWithChildren<{
    heading: string;
}>;

type DialogContextType = {
    ref?: RefObject<HTMLDialogElement>;

    setContent?: Dispatch<SetStateAction<DialogContentType | undefined>>;
};

const DialogContext = createContext<DialogContextType>({});
export default DialogContext;
