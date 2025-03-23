import * as ConditionDevice from "./Condition.schema.json" with { type: "json" };
import * as Delay from "./Delay.schema.json" with { type: "json" };
import * as Group from "./Group.schema.json" with { type: "json" };
import * as Log from "./Log.schema.json" with { type: "json" };
import * as Mutex from "./Mutex.schema.json" with { type: "json" };
import * as Scene from "./Scene.schema.json" with { type: "json" };
import * as Variable from "./Variable.schema.json" with { type: "json" };

export default function loadVirtualSchema() {
    return {
        ConditionDevice,
        Delay,
        Group,
        Log,
        Mutex,
        Scene,
        Variable,
    };
}
