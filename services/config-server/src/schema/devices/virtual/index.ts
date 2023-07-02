import * as Composite from "./Composite.schema.json";
import * as ConditionDevice from "./Condition.schema.json";
import * as Delay from "./Delay.schema.json";
import * as Log from "./Log.schema.json";
import * as Mutex from "./Mutex.schema.json";
import * as Scene from "./Scene.schema.json";
import * as Variable from "./Variable.schema.json";

export default function loadVirtualSchema() {
    return {
        Composite,
        ConditionDevice,
        Delay,
        Log,
        Mutex,
        Scene,
        Variable,
    };
}
