import {
    createContext,
    Dispatch,
    PropsWithChildren,
    ReactNode,
    RefObject,
    SetStateAction,
} from "react";

export type DialogContentType = PropsWithChildren<{
    heading: string;

    icon: ReactNode;
}>;

type DialogContextType = {
    ref?: RefObject<HTMLDialogElement>;

    setContent?: Dispatch<SetStateAction<DialogContentType | undefined>>;
};

const DialogContext = createContext<DialogContextType>({});
export default DialogContext;
