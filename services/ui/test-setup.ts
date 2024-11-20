import * as matchers from "@testing-library/jest-dom/matchers";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { beforeAll, expect, vi } from "vitest";
import defaults from "./public/locales/en-GB/defaults.json";
import translation from "./public/locales/en-GB/translation.json";

expect.extend(matchers);

beforeAll(() => {
    // setup i18next with en-GB translation
    i18n.use(initReactI18next).init({
        lng: "en-GB",
        debug: false,
        resources: {
            "en-GB": { translation, defaults },
        },
        interpolation: {
            escapeValue: false,
        },
        ns: ["translation", "defaults"],
    });

    // stub the global ResizeObserver (used by react-tooltip)
    const ResizeObserverMock = vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});
