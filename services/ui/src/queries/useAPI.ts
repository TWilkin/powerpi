import { useContext } from "react";
import { PowerPiAPIContext } from "./PowerPiApiContext";

export default function useAPI() {
    return useContext(PowerPiAPIContext);
}
