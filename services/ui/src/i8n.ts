import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
        supportedLngs: ["en-GB"],
        fallbackLng: "en-GB",
        debug: true,
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: {
            escapeValue: false,
        },
    });
export default i18n;
