import { FileDb } from "jovo-db-filedb";
import { App } from "jovo-framework";
import { Alexa } from "jovo-platform-alexa";
import { GoogleAssistant } from "jovo-platform-googleassistant";
import { JovoDebugger } from "jovo-plugin-debugger";

const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

app.setHandler({
  LAUNCH() {
    return this.toIntent("HelloWorldIntent");
  },

  HelloWorldIntent() {
    this.ask("Hello World! What's your name?", "Please tell me your name.");
  },

  MyNameIsIntent() {
    this.tell("Hey " + this.$inputs.name.value + ", nice to meet you!");
  }
});

export default app;
