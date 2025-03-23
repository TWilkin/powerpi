import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { beforeAll, vi } from "vitest";
import defaults from "./public/locales/en-GB/defaults.json";
import translation from "./public/locales/en-GB/translation.json";

beforeAll(() => {
    // setup i18next with en-GB translation
    i18n.use(initReactI18next).init({
        lng: "en-GB",
        supportedLngs: ["en-GB", "en-US"],
        debug: false,
        resources: {
            "en-GB": { translation, defaults },
            "en-US": { translation, defaults },
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
