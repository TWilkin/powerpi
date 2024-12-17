import { render, screen } from "@testing-library/react";
import FieldSet from "./FieldSet";

describe("FieldSet", () => {
    test("renders", () => {
        render(<FieldSet legend="Some Fields">Some Content</FieldSet>);

        const group = screen.getByRole("group");
        expect(group).toBeInTheDocument();
        expect(group).toHaveAccessibleName("Some Fields");
        expect(group).toHaveTextContent("Some Content");
    });
});
