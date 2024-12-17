import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DeviceFilter from "./DeviceFilter";
import useDeviceFilter from "./useDeviceFilter";

const mocks = vi.hoisted(() => ({
    useLocations: vi.fn(),
}));

vi.mock("../../hooks/useLocations", () => ({ default: mocks.useLocations }));

describe("DeviceFilter", () => {
    const defaultState: ReturnType<typeof useDeviceFilter>["state"] = {
        search: "",
        types: [],
        locations: [],
        visibleOnly: true,
    };

    beforeEach(() =>
        mocks.useLocations.mockReturnValue([
            {
                name: "location1",
                display_name: "Location 1",
            },
            { name: "location2" },
        ]),
    );

    test("closed", () => {
        render(
            <DeviceFilter
                open={false}
                state={defaultState}
                types={[]}
                locations={[]}
                dispatch={vi.fn()}
                clear={vi.fn()}
            />,
        );

        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    test("open", () => {
        render(
            <DeviceFilter
                open
                state={defaultState}
                types={["type1", "type2"]}
                locations={[undefined, "location2", "location1"]}
                dispatch={vi.fn()}
                clear={vi.fn()}
            />,
        );

        const aside = screen.getByRole("complementary");
        expect(aside).toBeInTheDocument();

        const types = within(aside).getByRole("group", { name: "Types" });
        expect(types).toBeInTheDocument();
        const typeCheckboxes = within(types).getAllByRole("checkbox");
        expect(typeCheckboxes).toHaveLength(1 + 2);
        expect(typeCheckboxes[0]).toHaveAccessibleName("All");
        expect(typeCheckboxes[1]).toHaveAccessibleName("type1");
        expect(typeCheckboxes[2]).toHaveAccessibleName("type2");

        const locations = within(aside).getByRole("group", { name: "Locations" });
        expect(locations).toBeInTheDocument();
        const locationCheckboxes = within(locations).getAllByRole("checkbox");
        expect(locationCheckboxes).toHaveLength(1 + 3);
        expect(locationCheckboxes[0]).toHaveAccessibleName("All");
        expect(locationCheckboxes[1]).toHaveAccessibleName("Location 1");
        expect(locationCheckboxes[2]).toHaveAccessibleName("location2");
        expect(locationCheckboxes[3]).toHaveAccessibleName("Unspecified");

        const visibility = within(aside).getByRole("group", { name: "Visibility" });
        expect(visibility).toBeInTheDocument();
        const visible = within(visibility).getByRole("checkbox", {
            name: "Only show visible devices",
        });
        expect(visible).toBeInTheDocument();
        expect(visible).toBeChecked();

        expect(screen.getByRole("button", { name: /Clear Filters/ })).toBeInTheDocument();
    });

    test("type selection", async () => {
        const dispatch = vi.fn();

        render(
            <DeviceFilter
                open
                state={{ ...defaultState, types: ["type2"] }}
                types={["type1", "type2"]}
                locations={[]}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const type1 = screen.getByRole("checkbox", { name: "type1" });
        expect(type1).toBeInTheDocument();
        expect(type1).not.toBeChecked();

        const type2 = screen.getByRole("checkbox", { name: "type2" });
        expect(type2).toBeInTheDocument();
        expect(type2).toBeChecked();

        await userEvent.click(type1);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "Types", types: ["type2", "type1"] });
    });

    test("location selection", async () => {
        const dispatch = vi.fn();

        render(
            <DeviceFilter
                open
                state={{ ...defaultState, locations: ["location2"] }}
                types={[]}
                locations={["location1", "location2"]}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const location1 = screen.getByRole("checkbox", { name: "Location 1" });
        expect(location1).toBeInTheDocument();
        expect(location1).not.toBeChecked();

        const location2 = screen.getByRole("checkbox", { name: "location2" });
        expect(location2).toBeInTheDocument();
        expect(location2).toBeChecked();

        await userEvent.click(location1);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: "Locations",
            locations: ["location2", "location1"],
        });
    });

    test("visible toggle", async () => {
        const dispatch = vi.fn();

        render(
            <DeviceFilter
                open
                state={defaultState}
                types={[]}
                locations={[]}
                dispatch={dispatch}
                clear={vi.fn()}
            />,
        );

        const visible = screen.getByRole("checkbox", {
            name: "Only show visible devices",
        });
        expect(visible).toBeInTheDocument();
        expect(visible).toBeChecked();

        await userEvent.click(visible);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: "VisibleOnly",
            visibleOnly: false,
        });
    });

    test("clear filters", async () => {
        const clear = vi.fn();

        render(
            <DeviceFilter
                open
                state={defaultState}
                types={[]}
                locations={[]}
                dispatch={vi.fn()}
                clear={clear}
            />,
        );

        const clearFilters = screen.getByRole("button", { name: /Clear Filters/ });
        expect(clearFilters).toBeInTheDocument();

        await userEvent.click(clearFilters);

        expect(clear).toHaveBeenCalledTimes(1);
    });
});
