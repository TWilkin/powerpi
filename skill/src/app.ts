import { FileDb } from "jovo-db-filedb";
import { App } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { JovoDebugger } from "jovo-plugin-debugger";
import { addDeviceTypes } from "./alexa";

const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

app.setHandler({
  async LAUNCH() {
    await addDeviceTypes(this.$alexaSkill);

    return this.toIntent("DevicePowerIntent");
  },

  DevicePowerIntent() {
    const status = interpretStatus(this.$inputs.status?.value);
    if (this.$inputs.device?.value && status) {
      this.tell(`Turning ${this.$inputs.device.value} ${status}`);
      return;
    }

    return this.toIntent("ErrorIntent");
  },

  ErrorIntent() {
    this.tell("I'm sorry, I didn't understand that.");
  }
});

export default app;

// this shouldn't be necessary but it's not working from the model
function interpretStatus(status?: string) {
  status = status?.toLowerCase();

  switch (status) {
    case "on":
    case "activate":
    case "enable":
      return "on";

    case "off":
    case "deactivate":
    case "terminate":
    case "disable":
      return "off";
  }

  return null;
}
