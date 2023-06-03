import { BaseComponent, Component, Intents } from "@jovotech/framework";

@Component()
export default class ErrorComponent extends BaseComponent {
    START() {
        this.error();
    }

    @Intents(["ErrorIntent"])
    error() {
        return this.$send("I'm sorry, I didn't understand that.");
    }

    @Intents(["ApiErrorIntent"])
    apiError() {
        return this.$send("I'm sorry, I was unable to make the request to Power Pi.");
    }
}
