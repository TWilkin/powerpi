import { BaseComponent, Component, Intents } from "@jovotech/framework";

@Component()
export default class DevicePowerComponent extends BaseComponent {
    START() {
        return this.$send({ message: "What would you like to do?" });
    }

    @Intents(["DevicePowerIntent"])
    action() {
        const status = this.$entities.status?.id;

        return this.$send({ message: `Turning turn light ${status}`, listen: false });
    }

    UNHANDLED() {
        return this.START();
    }
}
