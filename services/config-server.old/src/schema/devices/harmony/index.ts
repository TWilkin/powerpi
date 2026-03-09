import * as HarmonyActivity from "./HarmonyActivity.schema.json" with { type: "json" };
import * as HarmonyHub from "./HarmonyHub.schema.json" with { type: "json" };

export default function loadHarmonySchema() {
    return {
        HarmonyActivity,
        HarmonyHub,
    };
}
