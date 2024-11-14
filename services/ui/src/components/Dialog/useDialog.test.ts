import { act, renderHook, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import DialogHost from "./DialogHost";
import useDialog from "./useDialog";

const mocks = vi.hoisted(() => ({
    showModal: vi.fn(),
    close: vi.fn(),
}));

describe("useDialog", () => {
    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = mocks.showModal;
        HTMLDialogElement.prototype.close = mocks.close;

        vi.resetAllMocks();
    });

    test("opens dialog", () => {
        const { result } = renderHook(useDialog, { wrapper: DialogHost });

        const dialog = screen.getByRole("dialog", { hidden: true });
        expect(dialog).toBeInTheDocument();

        act(() => result.current.handleDialogOpen("My Dialog", "icon", "Content"));

        expect(mocks.showModal).toHaveBeenCalledTimes(1);

        expect(within(dialog).getByText(/My Dialog/)).toBeInTheDocument();
        expect(within(dialog).getByText(/icon/)).toBeInTheDocument();
        expect(within(dialog).getByText(/Content/)).toBeInTheDocument();
    });

    test("closes dialog", () => {
        const { result } = renderHook(useDialog, { wrapper: DialogHost });

        const dialog = screen.getByRole("dialog", { hidden: true });
        expect(dialog).toBeInTheDocument();

        act(() => result.current.handleDialogClose());

        expect(mocks.close).toHaveBeenCalledTimes(1);
    });
});
