import { App } from "@jovotech/framework";
import { AlexaPlatform } from "@jovotech/platform-alexa";
import DevicePowerComponent from "./components/DevicePowerComponent.js";
import ErrorComponent from "./components/ErrorComponent.js";
import GlobalComponent from "./components/GlobalComponent.js";
import LoginComponent from "./components/LoginComponent.js";

const app = new App({
    components: [GlobalComponent, DevicePowerComponent, ErrorComponent, LoginComponent],
    plugins: [
        new AlexaPlatform({
            intentMap: {
                "AMAZON.StopIntent": "END",
                "AMAZON.CancelIntent": "END",
            },
        }),
    ],
    logging: true,
});

export default app;
