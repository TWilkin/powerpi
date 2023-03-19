import { PowerPiApi } from "@powerpi/api";
import HttpStatusCodes from "http-status-codes";
import { useEffect, useMemo } from "react";

export default function useAPI() {
    const api = useMemo(() => new PowerPiApi(`${window.location.origin}/api`), []);

    // redirect to login on 401
    useEffect(
        () =>
            api.setErrorHandler((error) => {
                if (
                    error.response.status === HttpStatusCodes.UNAUTHORIZED &&
                    !window.location.pathname.endsWith("/login")
                ) {
                    window.location.pathname = "/login";
                }
            }),
        [api]
    );

    return api;
}
