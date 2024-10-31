import { PowerPiApi } from "@powerpi/common-api";
import HttpStatusCodes from "http-status-codes";
import { PropsWithChildren, createContext, useContext, useEffect } from "react";

export default function useAPI() {
    const api = useContext(PowerPiAPIContext);

    // redirect to login on 401
    useEffect(() => {
        api.setErrorHandler((error) => {
            if (
                error.response.status === HttpStatusCodes.UNAUTHORIZED &&
                !window.location.pathname.endsWith("/login")
            ) {
                window.location.pathname = "/login";
            }
        });
    }, [api]);

    return api;
}

// the context holding the API instance
const PowerPiAPIContext = createContext<PowerPiApi>(
    new PowerPiApi(`${window.location.origin}/api`),
);

// the API context provider
type PowerPiAPIContextProviderProps = PropsWithChildren<{
    api: PowerPiApi;
}>;

export const PowerPiAPIContextProvider = ({ api, children }: PowerPiAPIContextProviderProps) => (
    <PowerPiAPIContext.Provider value={api}>{children}</PowerPiAPIContext.Provider>
);
