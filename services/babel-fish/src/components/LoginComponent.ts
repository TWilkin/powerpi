import { BaseComponent, Component, Handle } from "@jovotech/framework";
import { LinkAccountCardOutput } from "@jovotech/platform-alexa";

@Component()
export default class LoginComponent extends BaseComponent {
    START() {
        if (this.$alexa) {
            this.alexaLogin();
        }
    }

    @Handle({
        intents: ["LoginIntent"],
        platforms: ["alexa"],
    })
    alexaLogin() {
        return this.$send(LinkAccountCardOutput, {
            message: "Please login to your Power Pi account through the Alexa app.",
        });
    }
}
