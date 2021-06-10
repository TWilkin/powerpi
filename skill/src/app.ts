import { App } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { addDeviceTypes } from "./alexa";
import { getDevices } from "./powerPiConfig";

const app = new App();

app.use(new Alexa(), new GoogleAssistant());

app.setHandler({
  LAUNCH() {},

  async DevicePowerIntent() {
    const deviceName: string | undefined = cleanString(
      this.$inputs.device?.value
    );
    const status = this.$inputs.status?.id ?? this.$inputs.status?.value;

    const devices = await getDevices();
    const device = deviceName
      ? devices.find(
          (device) =>
            cleanString(device.display_name) == deviceName ||
            cleanString(device.name) == deviceName.split(" ").join("")
        )
      : undefined;

    // the device was found
    if (device && status) {
      this.tell(`Turning ${device.display_name ?? device.name} ${status}`);
      return;
    }

    // the device was set but not found
    if (!device && deviceName) {
      await addDeviceTypes(this.$alexaSkill);

      this.ask(`I couldn't find device ${deviceName}, try again.`);
      return;
    }

    return this.toIntent("ErrorIntent");
  },

  CancelIntent() {
    this.tell("Aborting");
  },

  ErrorIntent() {
    this.tell("I'm sorry, I didn't understand that.");
  }
});

export default app;

function cleanString(value?: string) {
  if (!value) {
    return value;
  }

  return value.trim().toLowerCase().replace(".", "").replace("-", "");
}
