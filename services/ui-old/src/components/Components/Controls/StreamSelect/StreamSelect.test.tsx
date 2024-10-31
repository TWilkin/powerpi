import { fireEvent, render, screen } from "@testing-library/react";
import StreamSelect from "./StreamSelect";

test("Defaults", () => {
    render(
        <StreamSelect
            streams={["Radio", "Spotify", "Music"]}
            stream="Spotify"
            disabled={false}
            onChange={() => {}}
        />,
    );

    expect(screen.queryByText("Spotify")).toBeInTheDocument();
    expect(screen.queryByText("Radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Music")).not.toBeInTheDocument();
});

test("Search for a stream", () => {
    const onChange = jest.fn();

    render(
        <StreamSelect
            streams={["Radio", "Spotify", "Music"]}
            stream="Spotify"
            disabled={false}
            onChange={onChange}
        />,
    );

    const input = screen.queryByRole("combobox");
    expect(input).toBeInTheDocument();

    // should filter down to just "Music"
    fireEvent.change(input!, { target: { value: "mus" } });

    expect(screen.queryByText("Radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();

    const musicOption = screen.queryByText("Music");
    expect(musicOption).toBeInTheDocument();

    // clicking Music should fire the event
    fireEvent.click(musicOption!);

    expect(onChange).toHaveBeenCalledWith({ stream: "Music" });
});

test("Selecting from the menu", () => {
    const onChange = jest.fn();

    render(
        <StreamSelect
            streams={["Radio", "Spotify", "Music"]}
            stream="Spotify"
            disabled={false}
            onChange={onChange}
        />,
    );

    const input = screen.queryByRole("combobox");
    expect(input).toBeInTheDocument();

    // should open the menu
    fireEvent.focus(input!);
    fireEvent.keyDown(input!, { key: "ArrowDown", code: 40 });

    expect(screen.queryByText("Music")).toBeInTheDocument();

    const radioOption = screen.queryByText("Radio");
    expect(radioOption).toBeInTheDocument();

    // clicking Radio should fire the event
    fireEvent.click(radioOption!);

    expect(onChange).toHaveBeenCalledWith({ stream: "Radio" });
});

test("Disabled", () => {
    render(
        <StreamSelect
            streams={["Radio", "Spotify", "Music"]}
            stream="Spotify"
            disabled
            onChange={() => {}}
        />,
    );

    const input = screen.queryByRole("combobox", { hidden: true });
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
});

test("No Options", () => {
    render(
        <StreamSelect
            streams={["Radio", "Spotify", "Music"]}
            stream="Spotify"
            disabled={false}
            onChange={() => {}}
        />,
    );

    const input = screen.queryByRole("combobox");
    expect(input).toBeInTheDocument();

    // should filter down to nothing
    fireEvent.change(input!, { target: { value: "something" } });

    expect(screen.queryByText("Radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();
    expect(screen.queryByText("Music")).not.toBeInTheDocument();

    expect(screen.queryByText("No options")).toBeInTheDocument();
});
