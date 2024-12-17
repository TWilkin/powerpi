import { createContext, PropsWithChildren, useCallback, useMemo, useState } from "react";
import useNotification from "./useNotification";

type ChangingStateType = {
    [key: string]: boolean;
};

type NotificationContextType = {
    changingState?: ChangingStateType;

    setChangingState?: (device: string, changing: boolean) => void;
};

export const NotificationContext = createContext<NotificationContextType>({});

type NotificationContextProvider = PropsWithChildren<unknown>;

export const NotificationContextProvider = ({ children }: NotificationContextProvider) => {
    const [changingState, setChangingState] = useState<ChangingStateType>({});

    const handleChangingState = useCallback((device: string, changing: boolean) => {
        setChangingState((current) => ({
            ...current,
            [device]: changing,
        }));
    }, []);

    const context = useMemo(
        () => ({
            changingState,
            setChangingState: handleChangingState,
        }),
        [changingState, handleChangingState],
    );

    return (
        <NotificationContext.Provider value={context}>
            <NotificationInner>{children}</NotificationInner>
        </NotificationContext.Provider>
    );
};

type NotificationInnerProps = PropsWithChildren<unknown>;

const NotificationInner = ({ children }: NotificationInnerProps) => {
    useNotification();

    return <>{children}</>;
};
