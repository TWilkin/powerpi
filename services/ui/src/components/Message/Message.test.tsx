import { render, screen } from "@testing-library/react";
import Message from "./Message";

describe("Message", () => {
    const cases: { translation: "pages.home" | "pages.devices"; expected: string }[] = [
        { translation: "pages.home", expected: "No floor plan." },
        { translation: "pages.devices", expected: "No devices." },
    ];
    test.each(cases)("empty for $translation", ({ translation, expected }) => {
        render(<Message type="empty" translation={translation} />);

        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    test("unknown", () => {
        render(<Message type="unknown" translation="pages.home" value="blah" />);

        expect(
            screen.getByText('Floor "blah" is not present in the floor plan.'),
        ).toBeInTheDocument();
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
