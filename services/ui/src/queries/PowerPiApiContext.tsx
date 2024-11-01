import { PowerPiApi } from "@powerpi/common-api";
import { createContext, PropsWithChildren } from "react";
import { api } from "./client";

export const PowerPiAPIContext = createContext<PowerPiApi>(api);

type PowerPiAPIContextProvider = PropsWithChildren<unknown>;

export const PowerPiAPIContextProvider = ({ children }: PowerPiAPIContextProvider) => (
    <PowerPiAPIContext.Provider value={api}>{children}</PowerPiAPIContext.Provider>
);
