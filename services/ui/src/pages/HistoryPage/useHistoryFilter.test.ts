import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useHistoryFilter from "./useHistoryFilter";

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    useNavigate: vi.fn(),
    useEntity: vi.fn(),
}));

vi.mock("react-router-dom", () => ({ useNavigate: mocks.useNavigate }));
vi.mock("./useEntity", () => ({ default: mocks.useEntity }));

describe("useHistoryFilter", () => {
    const initialState = {
        type: undefined,
        entity: undefined,
        action: undefined,
    };

    beforeEach(() => {
        mocks.useNavigate.mockReturnValue(mocks.navigate);
        mocks.useEntity.mockReturnValue(undefined);
    });

    const entity = [undefined, "someEntity"];
    test.each(entity)("defaults entity=%s", (entity) => {
        mocks.useEntity.mockReturnValue(entity);

        const { result } = renderHook(useHistoryFilter);

        expect(result.current.state).toEqual({ ...initialState, entity });
    });

    test("type filter", () => {
        const { result } = renderHook(useHistoryFilter);

        expect(result.current.state).toEqual(initialState);

        act(() => result.current.dispatch({ type: "Type", _type: "someType" }));

        expect(result.current.state).toEqual({ ...initialState, type: "someType" });
    });

    test("entity filter", () => {
        const { result } = renderHook(useHistoryFilter);

        expect(result.current.state).toEqual(initialState);

        act(() => result.current.dispatch({ type: "Entity", entity: "someEntity" }));

        expect(result.current.state).toEqual({ ...initialState, entity: "someEntity" });
    });

    test("action filter", () => {
        const { result } = renderHook(useHistoryFilter);

        expect(result.current.state).toEqual(initialState);

        act(() => result.current.dispatch({ type: "Action", action: "someAction" }));

        expect(result.current.state).toEqual({ ...initialState, action: "someAction" });
    });

    test("clear filter", () => {
        const { result } = renderHook(useHistoryFilter);

        expect(result.current.state).toEqual(initialState);

        act(() => {
            result.current.dispatch({ type: "Type", _type: "someType" });
            result.current.dispatch({ type: "Entity", entity: "someEntity" });
            result.current.dispatch({ type: "Action", action: "someAction" });
        });

        expect(result.current.state).toEqual({
            type: "someType",
            entity: "someEntity",
            action: "someAction",
        });

        act(() => result.current.dispatch({ type: "Clear", initialState }));

        expect(result.current.state).toEqual(initialState);
    });

    test("unknown action", () => {
        const { result } = renderHook(useHistoryFilter);

        expect(() =>
            act(() =>
                result.current.dispatch({ type: "Unknown" } as unknown as Parameters<
                    typeof result.current.dispatch
                >[0]),
            ),
        ).toThrow("Unknown action");
    });
});
