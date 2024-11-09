import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { afterEach, beforeAll, expect } from "vitest";
import translation from "./public/locales/en-GB/translation.json";

expect.extend(matchers);

beforeAll(() => {
    // setup i18next with en-GB translation
    i18n.use(initReactI18next).init({
        lng: "en-GB",
        debug: false,
        resources: {
            "en-GB": { translation },
        },
        interpolation: {
            escapeValue: false,
        },
    });
});

afterEach(() => cleanup());
