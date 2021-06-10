import { App } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { addDeviceTypes } from "./alexa";

const app = new App();

app.use(new Alexa(), new GoogleAssistant());

app.setHandler({
  LAUNCH() {
    return this.toIntent("DevicePowerIntent");
  },

  async DevicePowerIntent() {
    await addDeviceTypes(this.$alexaSkill);

    const device = this.$inputs.device?.value;
    const status = this.$inputs.status?.id ?? this.$inputs.status?.value;

    if (device && status) {
      this.tell(`Turning ${device} ${status}`);
      return;
    }

    return this.toIntent("ErrorIntent");
  },

  ErrorIntent() {
    this.tell("I'm sorry, I didn't understand that.");
  }
});

export default app;
