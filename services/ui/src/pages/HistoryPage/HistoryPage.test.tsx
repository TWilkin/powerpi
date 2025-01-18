import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import HistoryPage from "./HistoryPage";

const mocks = vi.hoisted(() => ({
    useHistoryFilter: vi.fn(),
    useInfiniteQueryHistory: vi.fn(),
}));

vi.mock("./useHistoryFilter", () => ({ default: mocks.useHistoryFilter }));
vi.mock("../../queries/useInfiniteQueryHistory", () => ({
    default: mocks.useInfiniteQueryHistory,
}));

vi.mock("./HistoryFilter", () => ({
    default: ({ open }: { open: boolean }) => (
        <div data-testid="filter">{open ? "open" : "closed"}</div>
    ),
}));

window.Element.prototype.getBoundingClientRect = vi
    .fn()
    .mockReturnValue({ height: 1000, width: 1000 });

describe("HistoryPage", () => {
    const defaultFilter = {
        state: {},
        dispatch: vi.fn(),
        clear: vi.fn(),
    };

    const defaultQuery = {
        data: { pages: [{ data: [], records: 0 }] },
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
    };

    beforeEach(() => {
        mocks.useHistoryFilter.mockReturnValue(defaultFilter);
        mocks.useInfiniteQueryHistory.mockReturnValue(defaultQuery);
    });

    test("renders with no data", () => {
        render(<HistoryPage />);

        expect(screen.getByText("No history.")).toBeInTheDocument();
    });

    test("renders with data", () => {
        mocks.useInfiniteQueryHistory.mockReturnValue({
            ...defaultQuery,
            data: {
                pages: [
                    {
                        data: [
                            {
                                type: "type1",
                                entity: "entity1",
                                action: "action1",
                                timestamp: 1,
                                message: { message: 1 },
                            },
                            {
                                type: "type2",
                                entity: "entity2",
                                action: "action2",
                                timestamp: 2,
                                message: { message: 2 },
                            },
                        ],
                        records: 2,
                    },
                ],
            },
        });

        render(<HistoryPage />);

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const rows = within(table).getAllByRole("row");
        expect(rows).toHaveLength(1 + 2); // the header plus the data

        const headers = within(rows[0]).getAllByRole("columnheader");
        expect(headers).toHaveLength(5);
        expect(headers[0]).toHaveTextContent("Type");
        expect(headers[1]).toHaveTextContent("Entity");
        expect(headers[2]).toHaveTextContent("Action");
        expect(headers[3]).toHaveTextContent("When");
        expect(headers[4]).toHaveTextContent("Message");

        function checkRow(
            row: HTMLElement,
            type: string,
            entity: string,
            action: string,
            message: string,
        ) {
            const cells = within(row).getAllByRole("cell");
            expect(cells).toHaveLength(5);

            expect(cells[0]).toHaveTextContent(type);
            expect(cells[1]).toHaveTextContent(entity);
            expect(cells[2]).toHaveTextContent(action);
            expect(within(cells[3]).getByRole("time")).toBeInTheDocument();
            expect(cells[4]).toHaveTextContent(message);
        }

        checkRow(rows[1], "type1", "entity1", "action1", '{"message":1}');
        checkRow(rows[2], "type2", "entity2", "action2", '{"message":2}');
    });

    test("opens filter", async () => {
        render(<HistoryPage />);

        const button = screen.getByRole("button", { name: "Open filters" });
        expect(button).toBeInTheDocument();

        const filter = screen.getByTestId("filter");
        expect(filter).toBeInTheDocument();
        expect(filter).toHaveTextContent("closed");

        await userEvent.click(button);

        expect(filter).toHaveTextContent("open");
    });

    test("fetches more data", () => {
        const fetchNextPage = vi.fn();

        mocks.useInfiniteQueryHistory.mockReturnValue({
            ...defaultQuery,
            data: {
                pages: [
                    {
                        data: [
                            { type: "type1", entity: "entity1", action: "action1", timestamp: 1 },
                        ],
                        records: 1,
                    },
                ],
            },
            hasNextPage: true,
            fetchNextPage,
        });

        render(<HistoryPage />);

        expect(fetchNextPage).toHaveBeenCalled();
    });
});
