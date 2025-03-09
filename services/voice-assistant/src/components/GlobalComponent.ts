import { BaseComponent, Component, Global } from "@jovotech/framework";
import DevicePowerComponent from "./DevicePowerComponent.js";
import LoginComponent from "./LoginComponent.js";

@Global()
@Component()
export default class GlobalComponent extends BaseComponent {
    LAUNCH() {
        // check for login
        if (!this.$alexa?.$user.accessToken) {
            return this.$redirect(LoginComponent);
        }

        return this.$redirect(DevicePowerComponent);
    }
}
