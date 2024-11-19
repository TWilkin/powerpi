import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { NotificationContextProvider } from "./NotificationContext";
import useDeviceChangingState from "./useDeviceChangingState";

vi.mock("./useNotification", () => ({
    default: () => vi.fn(),
}));

describe("useDeviceChangingState", () => {
    test("works", () => {
        const { result } = renderHook(useDeviceChangingState, {
            wrapper: (props) => NotificationContextProvider({ ...props }),
        });

        expect(result.current).toBeDefined();
        expect(result.current.changingState).toStrictEqual({});
        expect(result.current.setChangingState).toBeDefined();

        act(() => result.current.setChangingState!("MyDevice", true));
        expect(result.current.changingState).toStrictEqual({ MyDevice: true });

        act(() => result.current.setChangingState!("MyOtherDevice", true));
        expect(result.current.changingState).toStrictEqual({ MyDevice: true, MyOtherDevice: true });

        act(() => result.current.setChangingState!("MyOtherDevice", false));
        expect(result.current.changingState).toStrictEqual({
            MyDevice: true,
            MyOtherDevice: false,
        });
    });
});
