import { render, screen } from "@testing-library/react";
import SensorIcon from "./SensorIcon";

describe("SensorIcon", () => {
    const types: { type: string; state?: string; expectedIcon: string }[] = [
        // simple
        { type: "electricity", expectedIcon: "bolt" },
        { type: "gas", expectedIcon: "fire-flame-simple" },
        { type: "humidity", expectedIcon: "droplet" },
        { type: "motion", expectedIcon: "person-walking" },
        { type: "switch", expectedIcon: "mobile-retro" },
        { type: "temperature", expectedIcon: "temperature-half" },
        // with manufacturer
        { type: "aqara_door", expectedIcon: "door-open" },
        { type: "too_many_splits_door", expectedIcon: "door-open" },
        { type: "_malformed__door", expectedIcon: "door-open" },
        // with state
        { type: "door", expectedIcon: "door-open" },
        { type: "door", state: "open", expectedIcon: "door-open" },
        { type: "door", state: "close", expectedIcon: "door-closed" },
        { type: "window", expectedIcon: "house-chimney-window" },
        { type: "window", state: "open", expectedIcon: "house-chimney-window" },
        { type: "window", state: "close", expectedIcon: "house-chimney" },
        // default
        { type: "other", expectedIcon: "question" },
    ];
    test.each(types)("$type with state $state has icon $icon", ({ type, state, expectedIcon }) => {
        render(<SensorIcon type={type} state={state} />);

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", expectedIcon);
    });
});
