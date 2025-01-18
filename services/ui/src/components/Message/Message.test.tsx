import { render, screen } from "@testing-library/react";
import Message from "./Message";

describe("Message", () => {
    const emptyPages: {
        translation: "pages.home" | "pages.devices" | "pages.history";
        expected: string;
    }[] = [
        { translation: "pages.home", expected: "No floor plan." },
        { translation: "pages.devices", expected: "No devices." },
        { translation: "pages.history", expected: "No history." },
    ];
    test.each(emptyPages)("empty for $translation", ({ translation, expected }) => {
        render(<Message type="empty" translation={translation} />);

        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    test("unknown", () => {
        render(<Message type="unknown" translation="pages.home" value="blah" />);

        expect(
            screen.getByText('Floor "blah" is not present in the floor plan.'),
        ).toBeInTheDocument();
    });

    const filteredPages: {
        translation: "pages.devices" | "pages.history";
        count: number;
        expected: string;
    }[] = [
        { translation: "pages.devices", count: 10, expected: "Filtered 10 devices." },
        { translation: "pages.devices", count: 1, expected: "Filtered 1 device." },
        { translation: "pages.history", count: 10, expected: "Filtered 10 records." },
        { translation: "pages.history", count: 1, expected: "Filtered 1 record." },
    ];
    test.each(filteredPages)(
        "filtered $count for $translation",
        ({ translation, count, expected }) => {
            render(<Message type="filtered" count={count} translation={translation} />);

            expect(screen.getByText(expected)).toBeInTheDocument();
        },
    );
});
