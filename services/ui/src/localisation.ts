import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// The list of supported languages and their labels
// Labels here should be written in the language they represent to ease user selection.
export const supportedLanguages = [
    { id: "en-GB", label: "English (UK)" },
    { id: "en-US", label: "English (US)" },
    { id: "es-ES", label: "Español" },
];

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
        supportedLngs: supportedLanguages.map((language) => language.id),
        fallbackLng: "en-GB",
        debug: false,
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: {
            escapeValue: false,
        },
    });
export default i18n;
