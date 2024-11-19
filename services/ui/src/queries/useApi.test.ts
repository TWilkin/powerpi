import { PowerPiApi } from "@powerpi/common-api";
import { renderHook } from "@testing-library/react";
import { PowerPiAPIContextProvider } from "./PowerPiApiContext";
import useAPI from "./useAPI";

describe("useApi", () => {
    test("works", () => {
        const { result } = renderHook(useAPI, {
            wrapper: (props) => PowerPiAPIContextProvider({ ...props }),
        });

        expect(result.current).toBeDefined();
        expect(result.current).toBeInstanceOf(PowerPiApi);
    });
});
