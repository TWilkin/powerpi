import { History } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import HistoryRow from "./HistoryRow";

describe("HistoryRow", () => {
    const now = new Date().getTime();

    const history: History = {
        type: "type1",
        entity: "entity1",
        action: "action1",
        timestamp: new Date(now - 1000).toISOString(),
        message: { key: "value" },
    };

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(now);
    });

    afterEach(() => vi.useRealTimers());

    test("renders", () => {
        render(
            <table>
                <tbody>
                    <HistoryRow row={history} index={0} height={50} />
                </tbody>
            </table>,
        );

        const row = screen.getByRole("row");
        expect(row).toBeInTheDocument();

        const cells = screen.getAllByRole("cell");
        expect(cells).toHaveLength(5);

        expect(within(cells[0]).getByText("type1")).toBeInTheDocument();
        expect(within(cells[1]).getByText("entity1")).toBeInTheDocument();
        expect(within(cells[2]).getByText("action1")).toBeInTheDocument();
        expect(within(cells[3]).getByText("1 second ago")).toBeInTheDocument();
        expect(within(cells[4]).getByText('{"key":"value"}')).toBeInTheDocument();
    });

    test("renders with no timestamp", () => {
        render(
            <table>
                <tbody>
                    <HistoryRow row={{ ...history, timestamp: undefined }} index={0} height={50} />
                </tbody>
            </table>,
        );

        const row = screen.getByRole("row");
        expect(row).toBeInTheDocument();

        const cells = screen.getAllByRole("cell");
        expect(cells).toHaveLength(5);

        expect(cells[3]).toBeEmptyDOMElement();
    });
});
