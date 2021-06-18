import { App, Jovo } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { PowerPiApi } from "powerpi-common-api";
import PowerPiConfig from "./powerPiConfig";
import { addDeviceTypes } from "./providers";

const app = new App();
const config = new PowerPiConfig();

app.use(new Alexa(), new GoogleAssistant());

app.setHandler({
  LAUNCH() {},

  async DevicePowerIntent() {
    const deviceName: string | undefined = cleanString(
      this.$inputs.device?.value
    );
    const status = this.$inputs.status?.id ?? this.$inputs.status?.value;

    const devices = await config.getDevices();
    const device = deviceName
      ? devices.find(
          (device) =>
            cleanString(device.display_name) == deviceName ||
            cleanString(device.name) == deviceName.split(" ").join("")
        )
      : undefined;

    // the device was found
    if (device && status) {
      if (
        !(await makeRequest((api: PowerPiApi) =>
          api.postMessage(device.name, status)
        ))
      ) {
        return this.toIntent("ApiErrorIntent");
      }

      this.tell(`Turning ${device.display_name ?? device.name} ${status}`);

      return;
    }

    // the device was set but not found
    if (!device && deviceName) {
      addDeviceTypes(this, devices);

      this.ask(`I couldn't find device ${deviceName}, try again.`);
      return;
    }

    return this.toIntent("ErrorIntent");
  },

  CancelIntent() {
    this.tell("Aborting.");
  },

  ErrorIntent() {
    this.tell("I'm sorry, I didn't understand that.");
  },

  ApiErrorIntent() {
    this.tell("I'm sorry, I was unable to make the request to Power Pi.");
  }
});

export default app;

function cleanString(value?: string) {
  if (!value) {
    return value;
  }

  return value.trim().toLowerCase().replace(".", "").replace("-", "");
}

async function makeRequest(func: (api: PowerPiApi) => Promise<void>) {
  const api = new PowerPiApi("http://deep-thought:3000/api");

  let success = true;
  api.setErrorHandler(() => (success = false));

  await func(api);

  return success;
}
