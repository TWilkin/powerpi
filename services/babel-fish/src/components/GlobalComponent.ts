import { BaseComponent, Component, Global } from "@jovotech/framework";
import DevicePowerComponent from "./DevicePowerComponent";
import LoginComponent from "./LoginComponent";

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
