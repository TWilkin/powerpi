import { PowerPiApi } from "@powerpi/common-api";
import { createContext, PropsWithChildren } from "react";

export const PowerPiAPIContext = createContext<PowerPiApi>(new PowerPiApi(""));

type PowerPiAPIContextProvider = PropsWithChildren<{
    api: PowerPiApi;
}>;

export const PowerPiAPIContextProvider = ({ api, children }: PowerPiAPIContextProvider) => (
    <PowerPiAPIContext.Provider value={api}>{children}</PowerPiAPIContext.Provider>
);
