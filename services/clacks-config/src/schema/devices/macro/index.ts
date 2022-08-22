import * as Composite from "./Composite.schema.json";
import * as Delay from "./Delay.schema.json";
import * as Log from "./Log.schema.json";
import * as Mutex from "./Mutex.schema.json";
import * as Variable from "./Variable.schema.json";

export default function loadMacroSchema() {
    return {
        Composite,
        Delay,
        Log,
        Mutex,
        Variable,
    };
}
