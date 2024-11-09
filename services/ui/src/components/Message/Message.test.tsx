import { render, screen } from "@testing-library/react";
import Message from "./Message";

describe("Message", () => {
    test("empty", () => {
        render(<Message type="empty" translation="pages.devices" />);

        expect(screen.getByText("No devices.")).toBeInTheDocument();
    });

    test("filtered 10", () => {
        render(<Message type="filtered" count={10} translation="pages.devices" />);

        expect(screen.getByText("Filtered 10 devices.")).toBeInTheDocument();
    });

    test("filtered 1", () => {
        render(<Message type="filtered" count={1} translation="pages.devices" />);

        expect(screen.getByText("Filtered 1 device.")).toBeInTheDocument();
    });
});
