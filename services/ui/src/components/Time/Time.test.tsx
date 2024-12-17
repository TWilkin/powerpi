import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Time from "./Time";

describe("Time", () => {
    const now = new Date().getTime();

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(now);
    });

    afterEach(() => vi.useRealTimers());

    const cases: { time: number; expected: string }[] = [
        // future
        { time: now + 1000 * 10, expected: "in 10 seconds" },
        // ago simple
        { time: now, expected: "in 0 seconds" },
        { time: now - 1000, expected: "1 second ago" },
        { time: now - 1000 * 60 * 2, expected: "2 minutes ago" },
        { time: now - 1000 * 60 * 60 * 3, expected: "3 hours ago" },
        { time: now - 1000 * 60 * 60 * 24 * 4, expected: "4 days ago" },
        { time: now - 1000 * 60 * 60 * 24 * 7 * 2, expected: "2 weeks ago" },
        { time: now - 1000 * 60 * 60 * 24 * 30 * 3, expected: "3 months ago" },
        { time: now - 1000 * 60 * 60 * 24 * 365 * 4, expected: "4 years ago" },
        // rounding
        { time: now - 1000 * 49, expected: "1 minute ago" },
        { time: now - 1000 * 60 * 49, expected: "1 hour ago" },
        { time: now - 1000 * 60 * 60 * 19.3, expected: "1 day ago" },
        { time: now - 1000 * 60 * 60 * 24 * 5.7, expected: "1 week ago" },
        { time: now - 1000 * 60 * 60 * 24 * 7 * 3.3, expected: "1 month ago" },
        { time: now - 1000 * 60 * 60 * 24 * 30 * 9.7, expected: "1 year ago" },
    ];
    test.each(cases)("renders $expected correctly", ({ time, expected }) => {
        render(<Time time={time} />);

        const element = screen.getByRole("time");
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent(expected);
    });

    test("renders never", () => {
        render(<Time time={-1} />);

        expect(screen.getByText("never")).toBeInTheDocument();
        expect(screen.queryByRole("time")).not.toBeInTheDocument();
    });

    const updates: { time: number; interval: number; expected: string[] }[] = [
        { time: now - 1000, interval: 1050, expected: ["1 second ago", "2 seconds ago"] },
        {
            time: now - 1000 * 60,
            interval: 1000 * 31,
            expected: ["1 minute ago", "2 minutes ago"],
        },
        {
            time: now - 1000 * 60 * 60,
            interval: 1000 * 60 * 30,
            expected: ["1 hour ago", "2 hours ago"],
        },
    ];
    test.each(updates)("updates $expected", ({ time, interval, expected }) => {
        render(<Time time={time} />);

        expect(screen.getByText(expected[0])).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(interval));

        expect(screen.getByText(expected[1])).toBeInTheDocument();
    });

    test("tooltip", async () => {
        const time = new Date();
        time.setTime(0);

        render(<Time time={time.getTime()} />);

        const element = screen.getByRole("time");
        expect(element).toBeInTheDocument();

        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        await userEvent.hover(element);

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(/1 January 1970 at /);
    });
});
