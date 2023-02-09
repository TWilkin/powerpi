import { useCallback, useState } from "react";

export default function useDialog() {
    const [showDialog, setShowDialog] = useState(false);

    const openDialog = useCallback(() => setShowDialog(true), []);

    const closeDialog = useCallback(() => setShowDialog(false), []);

    const toggleDialog = useCallback(() => setShowDialog((current) => !current), []);

    return {
        showDialog,
        openDialog,
        closeDialog,
        toggleDialog,
    };
}
