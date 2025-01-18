import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import HistoryFilter from "./HistoryFilter";
import useHistoryFilter from "./useHistoryFilter";

const mocks = vi.hoisted(() => ({
    useQueryHistoryTypes: vi.fn(),
    useQueryHistoryEntities: vi.fn(),
    useQueryHistoryActions: vi.fn(),
}));

vi.mock("../../queries/useQueryHistoryTypes", () => ({ default: mocks.useQueryHistoryTypes }));
vi.mock("../../queries/useQueryHistoryEntities", () => ({
    default: mocks.useQueryHistoryEntities,
}));
vi.mock("../../queries/useQueryHistoryActions", () => ({ default: mocks.useQueryHistoryActions }));

describe("HistoryFilter", () => {
    const defaultState: ReturnType<typeof useHistoryFilter>["state"] = {
        type: "",
        entity: "",
        action: "",
        start: undefined,
    };

    beforeEach(() => {
        mocks.useQueryHistoryTypes.mockReturnValue({ data: ["type1", "type2"], isFetching: false });
        mocks.useQueryHistoryEntities.mockReturnValue({
            data: ["entity1", "entity2"],
            isFetching: false,
        });
        mocks.useQueryHistoryActions.mockReturnValue({
            data: ["action1", "action2"],
            isFetching: false,
        });
    });

    test("closed", () => {
        render(
            <HistoryFilter open={false} state={defaultState} dispatch={vi.fn()} clear={vi.fn()} />,
        );

        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    test("open", () => {
        render(<HistoryFilter open state={defaultState} dispatch={vi.fn()} clear={vi.fn()} />);

        const panel = screen.getByRole("complementary");
        expect(panel).toBeInTheDocument();

        const types = screen.getByLabelText("Types");
        expect(types).toBeInTheDocument();

        const entities = screen.getByLabelText("Entities");
        expect(entities).toBeInTheDocument();

        const actions = screen.getByLabelText("Actions");
        expect(actions).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /Clear Filters/ })).toBeInTheDocument();
    });

    test("type selection", async () => {
        const dispatch = vi.fn();

        render(
            <HistoryFilter
                open
                state={{ ...defaultState, type: "type2" }}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const typeSelect = screen.getByLabelText("Types");
        expect(typeSelect).toBeInTheDocument();

        await userEvent.click(typeSelect);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("type1");
        expect(options[1]).toHaveTextContent("type2");

        await userEvent.click(options[0]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "Type", _type: "type1" });
    });

    test("entity selection", async () => {
        const dispatch = vi.fn();

        render(
            <HistoryFilter
                open
                state={{ ...defaultState, entity: "entity2" }}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const entitySelect = screen.getByLabelText("Entities");
        expect(entitySelect).toBeInTheDocument();

        await userEvent.click(entitySelect);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("entity1");
        expect(options[1]).toHaveTextContent("entity2");

        await userEvent.click(options[0]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "Entity", entity: "entity1" });
    });

    test("action selection", async () => {
        const dispatch = vi.fn();

        render(
            <HistoryFilter
                open
                state={{ ...defaultState, action: "action2" }}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const actionSelect = screen.getByLabelText("Actions");
        expect(actionSelect).toBeInTheDocument();

        await userEvent.click(actionSelect);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("action1");
        expect(options[1]).toHaveTextContent("action2");

        await userEvent.click(options[0]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "Action", action: "action1" });
    });

    test("clear filters", async () => {
        const clear = vi.fn();

        render(<HistoryFilter open state={defaultState} dispatch={vi.fn()} clear={clear} />);

        const clearFilters = screen.getByRole("button", { name: /Clear Filters/ });
        expect(clearFilters).toBeInTheDocument();

        await userEvent.click(clearFilters);

        expect(clear).toHaveBeenCalledTimes(1);
    });
});
