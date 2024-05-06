import { render, screen } from "@testing-library/react";
import SensorIcon from "./SensorIcon";

[
    // simple
    { type: "electricity", icon: "bolt" },
    { type: "gas", icon: "fire-flame-simple" },
    { type: "humidity", icon: "droplet" },
    { type: "motion", icon: "person-walking" },
    { type: "switch", icon: "mobile-retro" },
    { type: "temperature", icon: "temperature-half" },
    // with manufacturer
    { type: "aqara_door", icon: "door-open" },
    { type: "too_many_splits_door", icon: "door-open" },
    { type: "_malformed__door", icon: "door-open" },
    // with state
    { type: "door", icon: "door-open" },
    { type: "door", icon: "door-open", state: "open" },
    { type: "door", icon: "door-closed", state: "close" },
    { type: "window", icon: "house-chimney-window" },
    { type: "window", icon: "house-chimney-window", state: "open" },
    { type: "window", icon: "house-chimney", state: "close" },
    // default
    { type: "other", icon: "question" },
].forEach(({ type, state, icon }) =>
    test(`${type}: state->${state}`, () => {
        render(<SensorIcon type={type} state={state} />);

        const image = screen.getByRole("img", { hidden: true });
        expect(image).toBeInTheDocument();
        expect(image).toHaveClass(`fa-${icon}`);
    }),
);
