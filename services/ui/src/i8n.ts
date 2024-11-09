import i18n from "i18next";
import I18NextHttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next)
    .use(I18NextHttpBackend)
    .init({
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
