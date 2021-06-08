import { FileDb } from "jovo-db-filedb";
import { App } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { JovoDebugger } from "jovo-plugin-debugger";

const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

app.setHandler({
  LAUNCH() {
    return this.toIntent("DevicePowerIntent");
  },

  DevicePowerIntent() {
    this.tell(
      `Turning ${this.$inputs.device.value} ${this.$inputs.status.value}`
    );
  }
});

export default app;
